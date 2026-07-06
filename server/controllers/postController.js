import Post from '../models/Post.js';
import Community from '../models/Community.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { applyVote, getVoteState } from '../utils/applyVote.js';
import adjustKarma from '../utils/karma.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { bufferToDataUri } from '../middleware/upload.js';

const attachVoteState = (post, userId) => {
  const obj = post.toObject ? post.toObject() : post;
  obj.voteState = getVoteState(post, userId);
  obj.upvoteCount = post.upvotes.length;
  obj.downvoteCount = post.downvotes.length;
  delete obj.upvotes;
  delete obj.downvotes;
  return obj;
};

export const createPost = catchAsync(async (req, res) => {
  const { title, body, type, linkUrl, communityName, flair } = req.body;
  if (!title || !communityName) throw new ApiError(400, 'Title and community are required.');

  const community = await Community.findOne({ name: communityName.toLowerCase() });
  if (!community) throw new ApiError(404, `Community c/${communityName} not found.`);

  let images = [];
  if (req.files && req.files.length) {
    images = await Promise.all(
      req.files.map(async (file) => {
        const uploaded = await uploadImage(bufferToDataUri(file), 'cherryreddit/posts');
        return { url: uploaded.url, publicId: uploaded.publicId };
      })
    );
  }

  const post = await Post.create({
    title,
    body: body || '',
    type: type || (images.length ? 'image' : linkUrl ? 'link' : 'text'),
    linkUrl: linkUrl || '',
    images,
    author: req.user._id,
    community: community._id,
    flair: flair || '',
    upvotes: [req.user._id],
    downvotes: [],
    score: 1,
  });
  post.computeHotRank();
  await post.save();
  await adjustKarma(req.user._id, 'post', 1);

  const populated = await post.populate([
    { path: 'author', select: 'username avatar karma' },
    { path: 'community', select: 'name displayName icon themeColor' },
  ]);

  res.status(201).json({ success: true, post: attachVoteState(populated, req.user._id) });
});

// Unified feed: home ("all joined + trending fallback"), community, user profile, trending, search
export const getFeed = catchAsync(async (req, res) => {
  const { sort = 'hot', community, author, cursor, limit = 10 } = req.query;
  const query = { isRemoved: false };

  if (community) {
    const c = await Community.findOne({ name: community.toLowerCase() });
    if (!c) throw new ApiError(404, `Community c/${community} not found.`);
    query.community = c._id;
  } else if (req.query.joinedOnly === 'true' && req.user) {
    query.community = { $in: req.user.joinedCommunities };
  }

  if (author) {
    const u = await User.findOne({ username: author });
    if (!u) throw new ApiError(404, 'User not found.');
    query.author = u._id;
  }

  const sortMap = {
    hot: { hotRank: -1 },
    new: { createdAt: -1 },
    top: { score: -1 },
    trending: { score: -1, commentCount: -1 },
  };
  const sortField = sortMap[sort] || sortMap.hot;

  // Cursor pagination for infinite scroll: encode last doc's sort value + _id
  if (cursor) {
    const [cursorVal, cursorId] = cursor.split('_');
    const sortKey = Object.keys(sortField)[0];
    const cmp = sortField[sortKey] === -1 ? '$lt' : '$gt';
    query.$or = [
      { [sortKey]: { [cmp]: Number(cursorVal) } },
      { [sortKey]: Number(cursorVal), _id: { [cmp]: cursorId } },
    ];
  }

  const posts = await Post.find(query)
    .sort({ ...sortField, _id: -1 })
    .limit(Number(limit))
    .populate('author', 'username avatar karma')
    .populate('community', 'name displayName icon themeColor');

  const sortKey = Object.keys(sortField)[0];
  const nextCursor = posts.length === Number(limit) ? `${posts[posts.length - 1][sortKey]}_${posts[posts.length - 1]._id}` : null;

  const enriched = posts.map((p) => attachVoteState(p, req.user?._id));
  res.json({ success: true, posts: enriched, nextCursor });
});

export const getPost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username avatar karma')
    .populate('community', 'name displayName icon themeColor moderators');
  if (!post || post.isRemoved) throw new ApiError(404, 'Post not found.');

  res.json({ success: true, post: attachVoteState(post, req.user?._id) });
});

export const votePost = catchAsync(async (req, res) => {
  const { direction } = req.body; // 1, -1, or 0
  if (![1, -1, 0].includes(direction)) throw new ApiError(400, 'Invalid vote direction.');

  const post = await Post.findById(req.params.id);
  if (!post || post.isRemoved) throw new ApiError(404, 'Post not found.');

  const prevScore = post.score;
  const wasUpvotedByMe = getVoteState(post, req.user._id);
  applyVote(post, req.user._id, direction === 0 ? (wasUpvotedByMe === 1 ? -1 : 1) : direction);
  // direction 0 used by client to explicitly "unvote"; simplest: recompute via toggle
  if (direction === 0) {
    post.upvotes = post.upvotes.filter((id) => String(id) !== String(req.user._id));
    post.downvotes = post.downvotes.filter((id) => String(id) !== String(req.user._id));
    post.score = post.upvotes.length - post.downvotes.length;
  }
  post.computeHotRank();
  await post.save();

  const karmaDelta = post.score - prevScore;
  if (String(post.author) !== String(req.user._id)) {
    await adjustKarma(post.author, 'post', karmaDelta);
  }

  res.json({
    success: true,
    score: post.score,
    voteState: getVoteState(post, req.user._id),
  });
});

export const updatePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  if (String(post.author) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own posts.');
  }
  if (req.body.title !== undefined) post.title = req.body.title;
  if (req.body.body !== undefined) post.body = req.body.body;
  await post.save();
  res.json({ success: true, post });
});

export const deletePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('community', 'moderators');
  if (!post) throw new ApiError(404, 'Post not found.');

  const isOwner = String(post.author) === String(req.user._id);
  const isModerator = post.community?.moderators?.some((m) => String(m) === String(req.user._id));
  if (!isOwner && !isModerator && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to delete this post.');
  }

  for (const img of post.images) {
    await deleteImage(img.publicId);
  }
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ success: true, message: 'Post deleted.' });
});

export const moderatePost = catchAsync(async (req, res) => {
  // { action: 'remove' | 'restore' | 'pin' | 'unpin' | 'lock' | 'unlock', reason }
  const post = await Post.findById(req.params.id).populate('community', 'moderators');
  if (!post) throw new ApiError(404, 'Post not found.');

  const isModerator = post.community?.moderators?.some((m) => String(m) === String(req.user._id));
  if (!isModerator && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only moderators can perform this action.');
  }

  const { action, reason } = req.body;
  switch (action) {
    case 'remove':
      post.isRemoved = true;
      post.removedReason = reason || 'Violates community rules';
      break;
    case 'restore':
      post.isRemoved = false;
      post.removedReason = '';
      break;
    case 'pin':
      post.isPinned = true;
      break;
    case 'unpin':
      post.isPinned = false;
      break;
    case 'lock':
      post.isLocked = true;
      break;
    case 'unlock':
      post.isLocked = false;
      break;
    default:
      throw new ApiError(400, 'Unknown moderation action.');
  }
  await post.save();
  res.json({ success: true, post });
});

export const searchPosts = catchAsync(async (req, res) => {
  const { q, page = 1, limit = 15 } = req.query;
  if (!q) throw new ApiError(400, 'Search query is required.');

  const posts = await Post.find({ $text: { $search: q }, isRemoved: false })
    .sort({ score: 'textScore' })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('author', 'username avatar')
    .populate('community', 'name displayName icon');

  res.json({ success: true, posts: posts.map((p) => attachVoteState(p, req.user?._id)) });
});
