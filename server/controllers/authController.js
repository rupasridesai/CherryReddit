import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import generateToken from '../utils/generateToken.js';

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  return obj;
};

export const register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, email, and password are required.');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters.');
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existing) throw new ApiError(409, 'That username or email is already registered.');

  const user = await User.create({ username, email, password });
  const token = generateToken(user._id);

  res.status(201).json({ success: true, token, user: sanitizeUser(user) });
});

export const login = catchAsync(async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    throw new ApiError(400, 'Please provide your email/username and password.');
  }

  const user = await User.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect email/username or password.');
  }
  if (user.isBanned) throw new ApiError(403, 'This account has been suspended.');

  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  res.json({ success: true, token, user: sanitizeUser(user) });
});

export const getMe = catchAsync(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});
