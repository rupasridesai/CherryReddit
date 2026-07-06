import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Community from '../models/Community.js';
import Report from '../models/Report.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';

export const getStats = catchAsync(async (req, res) => {
  const [userCount, postCount, commentCount, communityCount, pendingReports] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Comment.countDocuments(),
    Community.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newPostsThisWeek = await Post.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

  res.json({
    success: true,
    stats: {
      userCount,
      postCount,
      commentCount,
      communityCount,
      pendingReports,
      newUsersThisWeek,
      newPostsThisWeek,
    },
  });
});

export const listUsers = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 25 } = req.query;
  const query = search ? { username: new RegExp(search, 'i') } : {};
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(query);
  res.json({ success: true, users, total });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'moderator', 'admin'].includes(role)) throw new ApiError(400, 'Invalid role.');
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, user });
});

export const banUser = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: true, banReason: reason || 'Violation of site rules' },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, user });
});

export const unbanUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: false, banReason: '' },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, user });
});

// -- Reports / moderation queue --

export const createReport = catchAsync(async (req, res) => {
  const { targetType, targetId, reason, details, communityId } = req.body;
  if (!targetType || !targetId) throw new ApiError(400, 'Report target is required.');

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    post: targetType === 'post' ? targetId : undefined,
    comment: targetType === 'comment' ? targetId : undefined,
    reportedUser: targetType === 'user' ? targetId : undefined,
    community: communityId,
    reason,
    details,
  });

  res.status(201).json({ success: true, report });
});

export const listReports = catchAsync(async (req, res) => {
  const { status = 'pending' } = req.query;
  const reports = await Report.find({ status })
    .sort({ createdAt: -1 })
    .populate('reporter', 'username')
    .populate('post', 'title')
    .populate('comment', 'body')
    .populate('reportedUser', 'username')
    .populate('community', 'name displayName');
  res.json({ success: true, reports });
});

export const resolveReport = catchAsync(async (req, res) => {
  const { status } = req.body; // 'actioned' | 'dismissed'
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolvedBy: req.user._id },
    { new: true }
  );
  if (!report) throw new ApiError(404, 'Report not found.');
  res.json({ success: true, report });
});
