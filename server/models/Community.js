import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 21,
      match: [/^[a-z0-9_]+$/, 'Community name can only contain lowercase letters, numbers, underscores'],
    },
    displayName: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, maxlength: 500, default: '' },
    rules: [{ title: String, body: String }],
    icon: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    banner: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    themeColor: { type: String, default: '#D73A49' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    memberCount: { type: Number, default: 1 },
    isNSFW: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

communitySchema.index({ name: 'text', displayName: 'text', description: 'text' });

export default mongoose.model('Community', communitySchema);
