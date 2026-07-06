import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import VoteButtons from '../components/VoteButtons.jsx';
import CommentThread from '../components/CommentThread.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ScallopDivider from '../components/ScallopDivider.jsx';
import { postApi, commentApi, userApi, adminApi } from '../api/endpoints.js';
import { timeAgo } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sort, setSort] = useState('top');
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        postApi.get(id),
        commentApi.forPost(id, sort),
      ]);
      setPost(postRes.data.post);
      setComments(commentsRes.data.comments);
    } catch (err) {
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sort]);

  const handleReplyAdded = (parentId, newComment) => {
    const insert = (nodes) =>
      nodes.map((n) => {
        if (n._id === parentId) {
          return { ...n, replies: [{ ...newComment, replies: [] }, ...(n.replies || [])] };
        }
        return { ...n, replies: insert(n.replies || []) };
      });
    setComments((prev) => insert(prev));
    setPost((p) => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
  };

  const submitTopLevelComment = async () => {
    if (!user) return navigate('/login');
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentApi.create({ body: commentBody, postId: id });
      setComments((prev) => [{ ...data.comment, replies: [] }, ...prev]);
      setPost((p) => ({ ...p, commentCount: (p.commentCount || 0) + 1 }));
      setCommentBody('');
      toast.success('Comment posted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    setSaved((s) => !s);
    try {
      await userApi.toggleSave(post._id);
    } catch {
      setSaved((s) => !s);
    }
  };

  const handleReport = async () => {
    if (!user) return navigate('/login');
    const reason = prompt('Why are you reporting this post? (spam, harassment, hate, misinformation, nsfw, other)', 'other');
    if (!reason) return;
    try {
      await adminApi.report({ targetType: 'post', targetId: post._id, reason });
      toast.success('Report submitted to moderators.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit report.');
    }
  };

  if (loading) return <Loader label="Fetching post…" />;
  if (!post) return <EmptyState emoji="🍂" title="Post not found" subtitle="It may have been removed." />;

  return (
    <div>
      <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <VoteButtons
            score={post.score}
            voteState={post.voteState}
            onVote={(direction) => postApi.vote(post._id, direction)}
            disabled={!user}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', display: 'flex', gap: 8, flexWrap: 'wrap', color: 'var(--burgundy)', opacity: 0.85 }}>
              <Link to={`/c/${post.community?.name}`} style={{ fontWeight: 800 }}>c/{post.community?.name}</Link>
              <span>•</span>
              <span>
                posted by <Link to={`/u/${post.author?.username}`} style={{ fontWeight: 700 }}>u/{post.author?.username}</Link>
              </span>
              <span>•</span>
              <span>{timeAgo(post.createdAt)}</span>
              {post.isLocked && <span>🔒 locked</span>}
            </div>
            <h1 style={{ fontSize: '1.6rem', marginTop: 8 }}>{post.title}</h1>
            {post.body && <p style={{ marginTop: 12, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.body}</p>}
            {post.linkUrl && (
              <a href={post.linkUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ marginTop: 10 }}>
                🔗 Visit link
              </a>
            )}
            {post.images?.map((img) => (
              <img key={img.publicId || img.url} src={img.url} alt="" style={{ width: '100%', borderRadius: 'var(--radius-md)', marginTop: 12 }} />
            ))}

            <div style={{ display: 'flex', gap: 14, marginTop: 16, fontSize: '0.82rem', fontWeight: 700, color: 'var(--burgundy)' }}>
              <span>💬 {post.commentCount ?? 0} comments</span>
              <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={handleSave}>
                {saved ? '★ Saved' : '☆ Save'}
              </button>
              <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={handleReport}>
                🚩 Report
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      <div className="card" style={{ padding: 20, marginTop: 18 }}>
        {!post.isLocked ? (
          <div>
            <textarea
              placeholder={user ? 'What are your thoughts?' : 'Log in to join the conversation.'}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              disabled={!user}
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-primary" onClick={submitTopLevelComment} disabled={submitting}>
                {submitting ? 'Posting…' : 'Comment'}
              </button>
            </div>
          </div>
        ) : (
          <p style={{ opacity: 0.7 }}>🔒 This post is locked. No new comments allowed.</p>
        )}

        <ScallopDivider style={{ margin: '18px 0' }} />

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {['top', 'new', 'old'].map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={sort === s ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ fontSize: '0.76rem', textTransform: 'capitalize', padding: '5px 12px' }}
            >
              {s}
            </button>
          ))}
        </div>

        {comments.length === 0 ? (
          <p style={{ opacity: 0.6, padding: '20px 0', textAlign: 'center' }}>No comments yet. Be the first! 🍒</p>
        ) : (
          <CommentThread comments={comments} postId={post._id} onReplyAdded={handleReplyAdded} />
        )}
      </div>
    </div>
  );
};

export default PostDetail;
