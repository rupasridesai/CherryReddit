import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';

export const getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('sender', 'username avatar')
    .populate('post', 'title')
    .populate('community', 'name displayName');

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res.json({ success: true, notifications, unreadCount });
});

export const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) throw new ApiError(404, 'Notification not found.');
  notification.isRead = true;
  await notification.save();
  res.json({ success: true });
});

export const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});
