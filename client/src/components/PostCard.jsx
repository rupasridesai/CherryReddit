import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import VoteButtons from './VoteButtons.jsx';
import { postApi, userApi } from '../api/endpoints.js';
import { timeAgo } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

const PostCard = ({ post, onRemoved, savedInitially = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(savedInitially);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    setSaved((s) => !s);
    try {
      await userApi.toggleSave(post._id);
    } catch {
      setSaved((s) => !s);
      toast.error('Could not update saved posts.');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await postApi.remove(post._id);
      toast.success('Post deleted.');
      onRemoved?.(post._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete post.');
    }
  };

  const isOwner = user && post.author && user._id === post.author._id;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="card"
      style={{ display: 'flex', padding: 18, gap: 14, cursor: 'pointer', position: 'relative' }}
      onClick={() => navigate(`/post/${post._id}`)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <VoteButtons
          score={post.score}
          voteState={post.voteState}
          onVote={(direction) => postApi.vote(post._id, direction)}
          disabled={!user}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--burgundy)', opacity: 0.85 }}>
          {post.community && (
            <Link
              to={`/c/${post.community.name}`}
              onClick={(e) => e.stopPropagation()}
              style={{ fontWeight: 800 }}
            >
              c/{post.community.name}
            </Link>
          )}
          <span>•</span>
          <span>
            posted by{' '}
            <Link to={`/u/${post.author?.username}`} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 700 }}>
              u/{post.author?.username}
            </Link>
          </span>
          <span>•</span>
          <span>{timeAgo(post.createdAt)}</span>
          {post.isPinned && <span title="Pinned by moderators">📌</span>}
          {post.isLocked && <span title="Locked">🔒</span>}
        </div>

        <h3 style={{ fontSize: '1.15rem', marginTop: 6, lineHeight: 1.3 }}>
          {post.flair && (
            <span
              style={{
                fontSize: '0.65rem',
                background: 'var(--pink)',
                color: 'var(--burgundy)',
                borderRadius: 999,
                padding: '3px 9px',
                marginRight: 8,
                fontWeight: 800,
                verticalAlign: 'middle',
              }}
            >
              {post.flair}
            </span>
          )}
          {post.title}
        </h3>

        {post.body && (
          <p
            style={{
              margin: '8px 0 0',
              color: 'var(--ink)',
              opacity: 0.85,
              fontSize: '0.92rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.body}
          </p>
        )}

        {post.images?.length > 0 && (
          <div style={{ marginTop: 10, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img
              src={post.images[0].url}
              alt=""
              style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: '0.82rem', fontWeight: 700, color: 'var(--burgundy)' }}>
          <span>💬 {post.commentCount ?? 0} comments</span>
          <button
            className="btn btn-ghost"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            onClick={handleSave}
          >
            {saved ? '★ Saved' : '☆ Save'}
          </button>
          {isOwner && (
            <button
              className="btn btn-outline"
              style={{ padding: '6px 14px', fontSize: '0.78rem', marginLeft: 'auto' }}
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
