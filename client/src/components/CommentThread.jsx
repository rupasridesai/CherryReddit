import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import VoteButtons from './VoteButtons.jsx';
import { commentApi } from '../api/endpoints.js';
import { timeAgo } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

const MAX_VISUAL_INDENT = 6;

const Comment = ({ comment, postId, onReplyAdded, depthOverride }) => {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localBody, setLocalBody] = useState(comment.body);
  const [editing, setEditing] = useState(false);
  const [removed, setRemoved] = useState(comment.isRemoved);

  const depth = Math.min(comment.depth ?? 0, MAX_VISUAL_INDENT);

  const submitReply = async () => {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentApi.create({ body: replyBody, postId, parentId: comment._id });
      onReplyAdded(comment._id, data.comment);
      setReplyBody('');
      setReplying(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    try {
      await commentApi.update(comment._id, localBody);
      setEditing(false);
      toast.success('Comment updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update comment.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentApi.remove(comment._id);
      setRemoved(true);
      setLocalBody('[deleted]');
      toast.success('Comment deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete comment.');
    }
  };

  const isOwner = user && comment.author && user._id === comment.author._id;

  return (
    <div
      style={{
        marginLeft: depth > 0 ? 18 : 0,
        borderLeft: depth > 0 ? '2px solid var(--pink)' : 'none',
        paddingLeft: depth > 0 ? 14 : 0,
        marginTop: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ paddingTop: 2 }}>
          <VoteButtons
            score={comment.score}
            voteState={comment.voteState}
            size="sm"
            disabled={!user || removed}
            onVote={(direction) => commentApi.vote(comment._id, direction)}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to={`/u/${comment.author?.username}`} style={{ fontWeight: 800, color: 'var(--burgundy)' }}>
              u/{comment.author?.username || '[deleted]'}
            </Link>
            <span style={{ opacity: 0.6 }}>{timeAgo(comment.createdAt)}</span>
            {comment.isEdited && <span style={{ opacity: 0.5 }}>(edited)</span>}
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{ background: 'none', border: 'none', opacity: 0.55, fontSize: '0.75rem', padding: 0 }}
            >
              [{collapsed ? '+' : '−'}]
            </button>
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                {editing ? (
                  <div style={{ marginTop: 6 }}>
                    <textarea
                      value={localBody}
                      onChange={(e) => setLocalBody(e.target.value)}
                      rows={3}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button className="btn btn-primary" style={{ fontSize: '0.78rem' }} onClick={submitEdit}>
                        Save
                      </button>
                      <button className="btn btn-outline" style={{ fontSize: '0.78rem' }} onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '4px 0 6px', fontSize: '0.9rem', opacity: removed ? 0.55 : 1, fontStyle: removed ? 'italic' : 'normal' }}>
                    {localBody}
                  </p>
                )}

                {!removed && !editing && (
                  <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', fontWeight: 700, color: 'var(--burgundy)' }}>
                    <button style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => setReplying((r) => !r)}>
                      Reply
                    </button>
                    {isOwner && (
                      <>
                        <button style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => setEditing(true)}>
                          Edit
                        </button>
                        <button style={{ background: 'none', border: 'none', padding: 0 }} onClick={handleDelete}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}

                {replying && (
                  <div style={{ marginTop: 8 }}>
                    <textarea
                      autoFocus
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="What are your thoughts?"
                      rows={2}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.78rem' }}
                        disabled={submitting}
                        onClick={submitReply}
                      >
                        {submitting ? 'Posting…' : 'Post reply'}
                      </button>
                      <button className="btn btn-outline" style={{ fontSize: '0.78rem' }} onClick={() => setReplying(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {comment.replies?.map((reply) => (
                  <Comment key={reply._id} comment={reply} postId={postId} onReplyAdded={onReplyAdded} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const CommentThread = ({ comments, postId, onReplyAdded }) => (
  <div>
    {comments.map((comment) => (
      <Comment key={comment._id} comment={comment} postId={postId} onReplyAdded={onReplyAdded} />
    ))}
  </div>
);

export default CommentThread;
