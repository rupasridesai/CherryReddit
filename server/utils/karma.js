import User from '../models/User.js';

/**
 * Adjusts a user's karma by a delta. Post/comment karma tracked separately
 * so profiles can show a breakdown, mirroring Reddit's post/comment karma split.
 * @param {string} userId
 * @param {'post'|'comment'} kind
 * @param {number} delta
 */
export const adjustKarma = async (userId, kind, delta) => {
  if (!userId || !delta) return;
  const field = kind === 'comment' ? 'karma.comment' : 'karma.post';
  await User.findByIdAndUpdate(userId, { $inc: { [field]: delta } });
};

export default adjustKarma;
