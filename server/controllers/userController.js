import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { bufferToDataUri } from '../middleware/upload.js';

export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw new ApiError(404, 'User not found.');

  const postCount = await Post.countDocuments({ author: user._id, isRemoved: false });
  const commentCount = await Comment.countDocuments({ author: user._id, isRemoved: false });

  res.json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      banner: user.banner,
      bio: user.bio,
      karma: user.karma,
      totalKarma: user.totalKarma,
      role: user.role,
      createdAt: user.createdAt,
      postCount,
      commentCount,
    },
  });
});

export const updateProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { bio } = req.body;
  if (bio !== undefined) user.bio = bio;

  if (req.files?.avatar?.[0]) {
    if (user.avatar.publicId) await deleteImage(user.avatar.publicId);
    const uploaded = await uploadImage(bufferToDataUri(req.files.avatar[0]), 'cherryreddit/avatars');
    user.avatar = { url: uploaded.url, publicId: uploaded.publicId };
  }
  if (req.files?.banner?.[0]) {
    if (user.banner.publicId) await deleteImage(user.banner.publicId);
    const uploaded = await uploadImage(bufferToDataUri(req.files.banner[0]), 'cherryreddit/banners');
    user.banner = { url: uploaded.url, publicId: uploaded.publicId };
  }

  await user.save();
  res.json({ success: true, user });
});

export const toggleSavePost = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const postId = req.params.postId;
  const isSaved = user.savedPosts.some((p) => String(p) === postId);

  if (isSaved) {
    user.savedPosts.pull(postId);
  } else {
    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, 'Post not found.');
    user.savedPosts.push(postId);
  }
  await user.save();
  res.json({ success: true, isSaved: !isSaved });
});

export const getSavedPosts = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedPosts',
    populate: [
      { path: 'author', select: 'username avatar' },
      { path: 'community', select: 'name displayName icon' },
    ],
  });
  res.json({ success: true, posts: user.savedPosts });
});

export const getUserComments = catchAsync(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw new ApiError(404, 'User not found.');

  const comments = await Comment.find({ author: user._id, isRemoved: false })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('post', 'title community')
    .populate({ path: 'post', populate: { path: 'community', select: 'name displayName' } });

  res.json({ success: true, comments });
});
