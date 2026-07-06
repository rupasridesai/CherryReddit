import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PostFeed from '../components/PostFeed.jsx';
import ScallopDivider from '../components/ScallopDivider.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { communityApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';

const CommunityPage = () => {
  const { name } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('hot');
  const [joining, setJoining] = useState(false);

  const fetchCommunity = () => {
    setLoading(true);
    communityApi
      .get(name)
      .then(({ data }) => {
        setCommunity(data.community);
        setIsMember(data.isMember);
        setIsModerator(data.isModerator);
      })
      .catch(() => setCommunity(null))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCommunity, [name]);

  const handleJoin = async () => {
    if (!user) return toast.error('Log in to join communities.');
    setJoining(true);
    try {
      const { data } = await communityApi.join(name);
      setIsMember(data.isMember);
      setCommunity((c) => ({ ...c, memberCount: data.memberCount }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update membership.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <Loader label="Fetching community…" />;
  if (!community) return <EmptyState emoji="🍃" title="Community not found" subtitle="This c/ doesn't exist (yet)." />;

  return (
    <div>
      <div className="card" style={{ overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ height: 100, background: community.themeColor || 'var(--rose)' }} />
        <div style={{ padding: '0 24px 20px', marginTop: -32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                border: '4px solid #fffdfa',
                background: community.icon?.url ? `url(${community.icon.url}) center/cover` : 'var(--pink)',
              }}
            />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem' }}>c/{community.name}</h1>
              <p style={{ margin: '2px 0 0', opacity: 0.75, fontSize: '0.85rem' }}>{community.memberCount} members</p>
            </div>
            <button className="btn btn-primary" onClick={handleJoin} disabled={joining}>
              {isMember ? 'Joined ✓' : 'Join'}
            </button>
            {isModerator && (
              <Link to={`/c/${name}/moderate`} className="btn btn-outline">
                Mod tools
              </Link>
            )}
          </div>
          {community.description && <p style={{ marginTop: 14, opacity: 0.85 }}>{community.description}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['hot', 'new', 'top'].map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={sort === s ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ fontSize: '0.82rem', textTransform: 'capitalize' }}
          >
            {s}
          </button>
        ))}
        {user && (
          <Link to={`/create-post?community=${community.name}`} className="btn btn-outline" style={{ marginLeft: 'auto', fontSize: '0.82rem' }}>
            + New post
          </Link>
        )}
      </div>

      <PostFeed
        params={{ sort, community: community.name }}
        emptyTitle={`No posts in c/${community.name} yet`}
        emptySubtitle="Start the conversation with the first post."
      />

      {community.rules?.length > 0 && (
        <div className="card" style={{ padding: 20, marginTop: 20 }}>
          <h4>📜 Community rules</h4>
          <ScallopDivider style={{ margin: '10px 0' }} />
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {community.rules.map((rule, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <strong>{rule.title}</strong>
                {rule.body && <p style={{ margin: '2px 0 0', opacity: 0.8, fontSize: '0.88rem' }}>{rule.body}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
