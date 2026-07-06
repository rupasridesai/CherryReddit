import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { applyVote, getVoteState } from '../utils/applyVote.js';
import adjustKarma from '../utils/karma.js';

const attachVoteState = (comment, userId) => {
  const obj = comment.toObject ? comment.toObject() : comment;
  obj.voteState = getVoteState(comment, userId);
  obj.upvoteCount = comment.upvotes.length;
  obj.downvoteCount = comment.downvotes.length;
  delete obj.upvotes;
  delete obj.downvotes;
  return obj;
};

export const createComment = catchAsync(async (req, res) => {
  const { body, postId, parentId } = req.body;
  if (!body || !postId) throw new ApiError(400, 'Comment body and post are required.');

  const post = await Post.findById(postId);
  if (!post || post.isRemoved) throw new ApiError(404, 'Post not found.');
  if (post.isLocked) throw new ApiError(403, 'This post is locked for new comments.');

  let path = '';
  let depth = 0;
  let parent = null;
  if (parentId) {
    parent = await Comment.findById(parentId);
    if (!parent) throw new ApiError(404, 'Parent comment not found.');
    path = `${parent.path}${parent._id},`;
    depth = parent.depth + 1;
  }

  const comment = await Comment.create({
    body,
    author: req.user._id,
    post: postId,
    parent: parentId || null,
    path,
    depth,
    upvotes: [req.user._id],
    score: 1,
  });

  post.commentCount += 1;
  await post.save();
  await adjustKarma(req.user._id, 'comment', 1);

  if (parent) {
    parent.replyCount += 1;
    await parent.save();
    if (String(parent.author) !== String(req.user._id)) {
      await Notification.create({
        recipient: parent.author,
        sender: req.user._id,
        type: 'comment_reply',
        post: postId,
        comment: comment._id,
        message: `u/${req.user.username} replied to your comment`,
      });
    }
  } else if (String(post.author) !== String(req.user._id)) {
    await Notification.create({
      recipient: post.author,
      sender: req.user._id,
      type: 'post_reply',
      post: postId,
      comment: comment._id,
      message: `u/${req.user.username} commented on your post`,
    });
  }

  const populated = await comment.populate('author', 'username avatar karma');
  res.status(201).json({ success: true, comment: attachVoteState(populated, req.user._id) });
});

// Returns the full nested tree for a post in one query using the materialized path,
// then assembles it in memory - avoids N+1 recursive lookups.
export const getCommentsForPost = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const { sort = 'top' } = req.query;

  const sortMap = {
    top: { score: -1 },
    new: { createdAt: -1 },
    old: { createdAt: 1 },
  };

  const comments = await Comment.find({ post: postId })
    .sort(sortMap[sort] || sortMap.top)
    .populate('author', 'username avatar karma');

  const enriched = comments.map((c) => attachVoteState(c, req.user?._id));

  const byId = new Map(enriched.map((c) => [String(c._id), { ...c, replies: [] }]));
  const roots = [];
  for (const c of byId.values()) {
    if (c.parent) {
      const parent = byId.get(String(c.parent));
      if (parent) parent.replies.push(c);
      else roots.push(c); // orphaned (parent deleted) — surface at top level
    } else {
      roots.push(c);
    }
  }

  res.json({ success: true, comments: roots });
});

export const voteComment = catchAsync(async (req, res) => {
  const { direction } = req.body;
  if (![1, -1, 0].includes(direction)) throw new ApiError(400, 'Invalid vote direction.');

  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found.');

  const prevScore = comment.score;
  if (direction === 0) {
    comment.upvotes = comment.upvotes.filter((id) => String(id) !== String(req.user._id));
    comment.downvotes = comment.downvotes.filter((id) => String(id) !== String(req.user._id));
    comment.score = comment.upvotes.length - comment.downvotes.length;
  } else {
    applyVote(comment, req.user._id, direction);
  }
  await comment.save();

  const karmaDelta = comment.score - prevScore;
  if (String(comment.author) !== String(req.user._id)) {
    await adjustKarma(comment.author, 'comment', karmaDelta);
  }

  res.json({ success: true, score: comment.score, voteState: getVoteState(comment, req.user._id) });
});

export const updateComment = catchAsync(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found.');
  if (String(comment.author) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own comments.');
  }
  comment.body = req.body.body;
  comment.isEdited = true;
  await comment.save();
  res.json({ success: true, comment });
});

export const deleteComment = catchAsync(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found.');
  if (String(comment.author) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own comments.');
  }
  // Soft delete preserves thread structure for replies, like Reddit's "[deleted]"
  comment.body = '[deleted]';
  comment.isRemoved = true;
  await comment.save();
  res.json({ success: true, message: 'Comment deleted.' });
});

export const moderateComment = catchAsync(async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate({
    path: 'post',
    populate: { path: 'community', select: 'moderators' },
  });
  if (!comment) throw new ApiError(404, 'Comment not found.');

  const isModerator = comment.post?.community?.moderators?.some(
    (m) => String(m) === String(req.user._id)
  );
  if (!isModerator && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only moderators can perform this action.');
  }

  const { action } = req.body;
  if (action === 'remove') {
    comment.isRemoved = true;
    comment.body = '[removed by moderator]';
  } else if (action === 'restore') {
    comment.isRemoved = false;
  } else {
    throw new ApiError(400, 'Unknown moderation action.');
  }
  await comment.save();
  res.json({ success: true, comment });
});
