import { useEffect, useRef, useCallback } from 'react';

/**
 * Calls onIntersect when the returned sentinel ref scrolls into view,
 * as long as hasMore is true and nothing is currently loading.
 */
export const useInfiniteScroll = ({ hasMore, loading, onLoadMore }) => {
  const sentinelRef = useRef(null);

  const observerCallback = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '400px',
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [observerCallback]);

  return sentinelRef;
};

export default useInfiniteScroll;
