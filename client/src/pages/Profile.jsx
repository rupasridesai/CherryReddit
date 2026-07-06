import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userApi } from '../api/endpoints.js';
import PostFeed from '../components/PostFeed.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ScallopDivider from '../components/ScallopDivider.jsx';
import { timeAgo, formatKarma } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('posts');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    userApi
      .profile(username)
      .then(({ data }) => setProfile(data.user))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (tab === 'comments') {
      userApi.comments(username).then(({ data }) => setComments(data.comments)).catch(() => {});
    }
  }, [tab, username]);

  if (loading) return <Loader label="Loading profile…" />;
  if (!profile) return <EmptyState emoji="🍂" title="User not found" />;

  const isSelf = currentUser?.username === username;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ height: 90, background: profile.banner?.url ? `url(${profile.banner.url}) center/cover` : 'var(--rose)' }} />
        <div style={{ padding: '0 24px 22px', marginTop: -30 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                border: '4px solid #fffdfa',
                background: profile.avatar?.url ? `url(${profile.avatar.url}) center/cover` : 'var(--pink)',
              }}
            />
            <div>
              <h1 style={{ fontSize: '1.4rem' }}>u/{profile.username}</h1>
              <p style={{ opacity: 0.7, fontSize: '0.82rem', margin: '2px 0 0' }}>
                Cherry since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            {isSelf && (
              <Link to="/settings" className="btn btn-outline" style={{ marginLeft: 'auto' }}>
                Edit profile
              </Link>
            )}
          </div>
          {profile.bio && <p style={{ marginTop: 14, opacity: 0.85 }}>{profile.bio}</p>}

          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--cherry)' }}>{formatKarma(profile.totalKarma)}</strong>
              <p style={{ margin: 0, fontSize: '0.76rem', opacity: 0.7 }}>karma</p>
            </div>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>{profile.postCount}</strong>
              <p style={{ margin: 0, fontSize: '0.76rem', opacity: 0.7 }}>posts</p>
            </div>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>{profile.commentCount}</strong>
              <p style={{ margin: 0, fontSize: '0.76rem', opacity: 0.7 }}>comments</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('posts')} className={tab === 'posts' ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: '0.82rem' }}>
          Posts
        </button>
        <button onClick={() => setTab('comments')} className={tab === 'comments' ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: '0.82rem' }}>
          Comments
        </button>
      </div>

      {tab === 'posts' ? (
        <PostFeed params={{ author: username, sort: 'new' }} emptyTitle="No posts yet" />
      ) : (
        <div className="card" style={{ padding: 16 }}>
          {comments.length === 0 ? (
            <EmptyState title="No comments yet" />
          ) : (
            comments.map((c, i) => (
              <div key={c._id} style={{ padding: '12px 6px', borderBottom: i < comments.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <p style={{ fontSize: '0.78rem', opacity: 0.7, margin: 0 }}>
                  on <Link to={`/post/${c.post?._id}`} style={{ fontWeight: 700 }}>{c.post?.title}</Link> · {timeAgo(c.createdAt)}
                </p>
                <p style={{ margin: '4px 0 0' }}>{c.body}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
