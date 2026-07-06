import Community from '../models/Community.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { bufferToDataUri } from '../middleware/upload.js';

export const createCommunity = catchAsync(async (req, res) => {
  const { name, displayName, description, themeColor, isNSFW, isPrivate } = req.body;
  if (!name || !displayName) throw new ApiError(400, 'Community name and display name are required.');

  const exists = await Community.findOne({ name: name.toLowerCase() });
  if (exists) throw new ApiError(409, `c/${name} already exists.`);

  const community = await Community.create({
    name: name.toLowerCase(),
    displayName,
    description,
    themeColor,
    isNSFW: !!isNSFW,
    isPrivate: !!isPrivate,
    creator: req.user._id,
    moderators: [req.user._id],
    members: [req.user._id],
    memberCount: 1,
  });

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedCommunities: community._id } });

  res.status(201).json({ success: true, community });
});

export const listCommunities = catchAsync(async (req, res) => {
  const { search, sort = 'popular', page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };

  const sortMap = {
    popular: { memberCount: -1 },
    new: { createdAt: -1 },
    alphabetical: { displayName: 1 },
  };

  const communities = await Community.find(query)
    .sort(sortMap[sort] || sortMap.popular)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Community.countDocuments(query);
  res.json({ success: true, communities, total, page: Number(page), hasMore: page * limit < total });
});

export const getCommunity = catchAsync(async (req, res) => {
  const community = await Community.findOne({ name: req.params.name.toLowerCase() })
    .populate('creator', 'username avatar')
    .populate('moderators', 'username avatar');
  if (!community) throw new ApiError(404, `Community c/${req.params.name} not found.`);

  const isMember = req.user ? community.members.some((m) => m.equals(req.user._id)) : false;
  const isModerator = req.user ? community.moderators.some((m) => m._id.equals(req.user._id)) : false;

  res.json({ success: true, community, isMember, isModerator });
});

export const updateCommunity = catchAsync(async (req, res) => {
  const community = await Community.findOne({ name: req.params.name.toLowerCase() });
  if (!community) throw new ApiError(404, 'Community not found.');

  const isModerator = community.moderators.some((m) => m.equals(req.user._id));
  if (!isModerator && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only moderators can edit this community.');
  }

  const { displayName, description, themeColor, rules, isNSFW, isPrivate } = req.body;
  if (displayName !== undefined) community.displayName = displayName;
  if (description !== undefined) community.description = description;
  if (themeColor !== undefined) community.themeColor = themeColor;
  if (rules !== undefined) community.rules = rules;
  if (isNSFW !== undefined) community.isNSFW = isNSFW;
  if (isPrivate !== undefined) community.isPrivate = isPrivate;

  if (req.file) {
    if (community.icon.publicId) await deleteImage(community.icon.publicId);
    const uploaded = await uploadImage(bufferToDataUri(req.file), 'cherryreddit/communities');
    community.icon = { url: uploaded.url, publicId: uploaded.publicId };
  }

  await community.save();
  res.json({ success: true, community });
});

export const joinCommunity = catchAsync(async (req, res) => {
  const community = await Community.findOne({ name: req.params.name.toLowerCase() });
  if (!community) throw new ApiError(404, 'Community not found.');

  const alreadyMember = community.members.some((m) => m.equals(req.user._id));
  if (alreadyMember) {
    community.members.pull(req.user._id);
    community.memberCount = Math.max(0, community.memberCount - 1);
    await User.findByIdAndUpdate(req.user._id, { $pull: { joinedCommunities: community._id } });
  } else {
    community.members.push(req.user._id);
    community.memberCount += 1;
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedCommunities: community._id } });
  }
  await community.save();

  res.json({ success: true, isMember: !alreadyMember, memberCount: community.memberCount });
});

export const addModerator = catchAsync(async (req, res) => {
  const community = await Community.findOne({ name: req.params.name.toLowerCase() });
  if (!community) throw new ApiError(404, 'Community not found.');
  if (!community.moderators.some((m) => m.equals(req.user._id)) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only moderators can add other moderators.');
  }
  const targetUser = await User.findOne({ username: req.body.username });
  if (!targetUser) throw new ApiError(404, 'User not found.');

  community.moderators.addToSet(targetUser._id);
  community.members.addToSet(targetUser._id);
  await community.save();

  res.json({ success: true, community });
});

export const getTrendingCommunities = catchAsync(async (req, res) => {
  const communities = await Community.find().sort({ memberCount: -1 }).limit(10);
  res.json({ success: true, communities });
});
