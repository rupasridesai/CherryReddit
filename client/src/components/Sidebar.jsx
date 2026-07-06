import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import ScallopDivider from './ScallopDivider.jsx';

const Sidebar = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    communityApi.trending().then(({ data }) => setTrending(data.communities)).catch(() => {});
  }, []);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 10px' }}>
          <h4 style={{ fontSize: '1rem' }}>🍬 Trending communities</h4>
        </div>
        <ScallopDivider />
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {trending.map((c, i) => (
            <Link
              key={c._id}
              to={`/c/${c.name}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 10 }}
            >
              <span style={{ fontWeight: 800, color: 'var(--rose)', width: 18 }}>{i + 1}</span>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: c.icon?.url ? `url(${c.icon.url}) center/cover` : 'var(--pink)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>c/{c.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.6 }}>{c.memberCount}</span>
            </Link>
          ))}
          {trending.length === 0 && <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>No communities yet.</p>}
        </div>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <h4 style={{ fontSize: '1rem', marginBottom: 10 }}>🍒 About CherryReddit</h4>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>
          A scrapbook-styled community feed. Create c/communities, share posts, vote, and build karma —
          the whole orchard is yours to tend.
        </p>
        {!user && (
          <Link to="/register" className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}>
            Join CherryReddit
          </Link>
        )}
        <Link to="/create-community" className="btn btn-ghost" style={{ width: '100%', marginTop: 10 }}>
          Start a community
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
