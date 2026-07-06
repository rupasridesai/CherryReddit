import { useState } from 'react';
import PostFeed from '../components/PostFeed.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ScallopDivider from '../components/ScallopDivider.jsx';

const TABS = [
  { key: 'hot', label: '🔥 Hot' },
  { key: 'new', label: '🌱 New' },
  { key: 'top', label: '🏆 Top' },
  { key: 'trending', label: '📈 Trending' },
];

const Home = () => {
  const { user } = useAuth();
  const [sort, setSort] = useState('hot');
  const [joinedOnly, setJoinedOnly] = useState(false);

  return (
    <div>
      <div className="card" style={{ padding: '20px 24px', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <h1 style={{ fontSize: '1.7rem' }}>The Cherry Orchard 🍒</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.8 }}>Fresh takes, sweet debates, and communities worth savoring.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key)}
            className={sort === tab.key ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ fontSize: '0.82rem' }}
          >
            {tab.label}
          </button>
        ))}
        {user && (
          <button
            onClick={() => setJoinedOnly((j) => !j)}
            className={joinedOnly ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ fontSize: '0.82rem', marginLeft: 'auto' }}
          >
            {joinedOnly ? '✓ My communities' : 'Show my communities'}
          </button>
        )}
      </div>

      <PostFeed
        params={{ sort, joinedOnly: joinedOnly ? 'true' : undefined }}
        emptyTitle="The orchard is quiet"
        emptySubtitle="Join a community or create the first post to get things growing."
      />
    </div>
  );
};

export default Home;
