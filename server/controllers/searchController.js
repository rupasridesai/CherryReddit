import Post from '../models/Post.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { getVoteState } from '../utils/applyVote.js';

export const globalSearch = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) throw new ApiError(400, 'Search query is required.');

  const regex = new RegExp(q.trim(), 'i');

  const [posts, communities, users] = await Promise.all([
    Post.find({ title: regex, isRemoved: false })
      .limit(10)
      .populate('author', 'username avatar')
      .populate('community', 'name displayName icon'),
    Community.find({ $or: [{ name: regex }, { displayName: regex }] }).limit(6),
    User.find({ username: regex }).select('username avatar karma').limit(6),
  ]);

  const enrichedPosts = posts.map((p) => {
    const obj = p.toObject();
    obj.voteState = getVoteState(p, req.user?._id);
    obj.upvoteCount = p.upvotes.length;
    delete obj.upvotes;
    delete obj.downvotes;
    return obj;
  });

  res.json({ success: true, posts: enrichedPosts, communities, users });
});
