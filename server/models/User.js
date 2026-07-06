import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    banner: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: { type: String, maxlength: 300, default: '' },
    karma: {
      post: { type: Number, default: 0 },
      comment: { type: Number, default: 0 },
    },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    savedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: '' },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.virtual('totalKarma').get(function () {
  return (this.karma?.post || 0) + (this.karma?.comment || 0);
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
