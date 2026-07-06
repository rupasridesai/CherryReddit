import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { userApi } from '../api/endpoints.js';

const SavedPosts = () => {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    userApi.saved().then(({ data }) => setPosts(data.posts)).catch(() => setPosts([]));
  }, []);

  if (posts === null) return <Loader label="Fetching your saved posts…" />;

  return (
    <div>
      <h1 style={{ marginBottom: 18 }}>⭐ Saved posts</h1>
      {posts.length === 0 ? (
        <EmptyState emoji="📌" title="No saved posts yet" subtitle="Tap 'Save' on any post to find it here later." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} savedInitially onRemoved={() => setPosts((p) => p.filter((x) => x._id !== post._id))} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPosts;
