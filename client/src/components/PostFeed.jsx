import { useEffect, useState, useCallback } from 'react';
import PostCard from './PostCard.jsx';
import Loader from './Loader.jsx';
import EmptyState from './EmptyState.jsx';
import { postApi } from '../api/endpoints.js';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';

/**
 * Fetches and renders a paginated, infinite-scrolling list of posts.
 * `params` are passed straight to GET /posts (community, author, sort, joinedOnly).
 */
const PostFeed = ({ params = {}, emptyTitle = 'Nothing here yet', emptySubtitle = 'Be the first to post something.' }) => {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const loadPage = useCallback(
    async (nextCursor) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await postApi.feed({ ...params, cursor: nextCursor || undefined });
        setPosts((prev) => (nextCursor ? [...prev, ...data.posts] : data.posts));
        setCursor(data.nextCursor);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load posts.');
      } finally {
        setLoading(false);
        setInitialLoaded(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramsKey]
  );

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setInitialLoaded(false);
    loadPage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const sentinelRef = useInfiniteScroll({
    hasMore: !!cursor,
    loading,
    onLoadMore: () => loadPage(cursor),
  });

  const handleRemoved = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  if (!initialLoaded && loading) return <Loader label="Fetching fresh posts…" />;
  if (error && posts.length === 0) return <EmptyState emoji="⚠️" title="Something went wrong" subtitle={error} />;
  if (posts.length === 0) return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onRemoved={handleRemoved} />
      ))}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && initialLoaded && <Loader label="Loading more…" size={28} />}
      {!cursor && posts.length > 0 && (
        <p style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.85rem', padding: '12px 0' }}>
          🍒 You've reached the bottom of the jar.
        </p>
      )}
    </div>
  );
};

export default PostFeed;
