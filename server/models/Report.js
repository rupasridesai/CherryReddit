import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment', 'user'], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'hate', 'misinformation', 'nsfw', 'other'],
      default: 'other',
    },
    details: { type: String, maxlength: 500, default: '' },
    status: { type: String, enum: ['pending', 'actioned', 'dismissed'], default: 'pending' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
