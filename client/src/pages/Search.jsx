import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { searchApi } from '../api/endpoints.js';

const Search = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!q) return;
    setResults(null);
    searchApi.global(q).then(({ data }) => setResults(data)).catch(() => setResults({ posts: [], communities: [], users: [] }));
  }, [q]);

  if (!q) return <EmptyState title="Search CherryReddit" subtitle="Try a keyword up in the search bar." />;
  if (!results) return <Loader label={`Searching for "${q}"…`} />;

  const { posts, communities, users } = results;
  const nothingFound = posts.length === 0 && communities.length === 0 && users.length === 0;

  return (
    <div>
      <h1 style={{ marginBottom: 18, fontSize: '1.4rem' }}>Results for "{q}"</h1>

      {nothingFound && <EmptyState emoji="🔍" title="No results" subtitle="Try a different search term." />}

      {communities.length > 0 && (
        <div className="card" style={{ padding: 18, marginBottom: 16 }}>
          <h4 style={{ marginBottom: 10 }}>Communities</h4>
          {communities.map((c) => (
            <Link key={c._id} to={`/c/${c.name}`} style={{ display: 'block', padding: '8px 4px', fontWeight: 700 }}>
              c/{c.name} <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '0.82rem' }}>· {c.memberCount} members</span>
            </Link>
          ))}
        </div>
      )}

      {users.length > 0 && (
        <div className="card" style={{ padding: 18, marginBottom: 16 }}>
          <h4 style={{ marginBottom: 10 }}>People</h4>
          {users.map((u) => (
            <Link key={u._id} to={`/u/${u.username}`} style={{ display: 'block', padding: '8px 4px', fontWeight: 700 }}>
              u/{u.username}
            </Link>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
