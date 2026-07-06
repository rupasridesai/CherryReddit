import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { communityApi, postApi } from '../api/endpoints.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { timeAgo } from '../utils/format.js';

const ModeratePosts = () => {
  const { name } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modUsername, setModUsername] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [communityRes, postsRes] = await Promise.all([
        communityApi.get(name),
        postApi.feed({ community: name, sort: 'new', limit: 25 }),
      ]);
      setCommunity(communityRes.data);
      setPosts(postsRes.data.posts);
    } catch {
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const act = async (postId, action) => {
    try {
      const { data } = await postApi.moderate(postId, action);
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...data.post } : p)));
      toast.success(`Post ${action}d.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const addModerator = async (e) => {
    e.preventDefault();
    if (!modUsername.trim()) return;
    try {
      await communityApi.addModerator(name, modUsername.trim());
      toast.success(`u/${modUsername} is now a moderator.`);
      setModUsername('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add moderator.');
    }
  };

  if (loading) return <Loader label="Loading mod tools…" />;
  if (!community || !community.isModerator) {
    return <EmptyState emoji="🚫" title="Not authorized" subtitle="Only moderators of this community can view this page." />;
  }

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>🛠️ Moderate c/{name}</h1>
      <p style={{ opacity: 0.75, marginBottom: 20 }}>Pin, lock, or remove posts; manage your team.</p>

      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <h4 style={{ marginBottom: 10 }}>Add a moderator</h4>
        <form onSubmit={addModerator} style={{ display: 'flex', gap: 8 }}>
          <input placeholder="username" value={modUsername} onChange={(e) => setModUsername(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-primary">Add</button>
        </form>
      </div>

      <div className="card" style={{ padding: 14 }}>
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" />
        ) : (
          posts.map((p, i) => (
            <div key={p._id} style={{ padding: '12px 6px', borderBottom: i < posts.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <Link to={`/post/${p._id}`} style={{ fontWeight: 700 }}>{p.title}</Link>
              <p style={{ margin: '4px 0', fontSize: '0.78rem', opacity: 0.7 }}>
                by u/{p.author?.username} · {timeAgo(p.createdAt)} · {p.isRemoved ? 'removed' : 'visible'} {p.isPinned && '· pinned'} {p.isLocked && '· locked'}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" style={{ fontSize: '0.72rem' }} onClick={() => act(p._id, p.isRemoved ? 'restore' : 'remove')}>
                  {p.isRemoved ? 'Restore' : 'Remove'}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: '0.72rem' }} onClick={() => act(p._id, p.isPinned ? 'unpin' : 'pin')}>
                  {p.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: '0.72rem' }} onClick={() => act(p._id, p.isLocked ? 'unlock' : 'lock')}>
                  {p.isLocked ? 'Unlock' : 'Lock'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModeratePosts;
