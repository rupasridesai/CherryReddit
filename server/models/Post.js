import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    body: { type: String, default: '', maxlength: 40000 },
    type: { type: String, enum: ['text', 'image', 'link'], default: 'text' },
    linkUrl: { type: String, default: '' },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isRemoved: { type: Boolean, default: false },
    removedReason: { type: String, default: '' },
    flair: { type: String, default: '' },
    // Hot rank: combines score and recency, recalculated on vote (Reddit-style "hot" algorithm)
    hotRank: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', body: 'text' });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ hotRank: -1 });
postSchema.index({ score: -1 });

// Reddit-style hot ranking: log of score magnitude + time decay
postSchema.methods.computeHotRank = function () {
  const score = this.score;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = (this.createdAt ? this.createdAt.getTime() : Date.now()) / 1000 - 1609459200;
  this.hotRank = sign * order + seconds / 45000;
  return this.hotRank;
};

export default mongoose.model('Post', postSchema);
