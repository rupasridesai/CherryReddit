import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, maxlength: 10000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    // Materialized path (e.g. ",parentId,grandparentId,") enables fast depth/ancestor queries
    // without recursive lookups when rendering nested threads.
    path: { type: String, default: '' },
    depth: { type: Number, default: 0 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    score: { type: Number, default: 0 },
    isRemoved: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    replyCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, path: 1 });
commentSchema.index({ post: 1, parent: 1 });

export default mongoose.model('Comment', commentSchema);
