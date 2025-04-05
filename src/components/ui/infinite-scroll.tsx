
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

interface InfiniteScrollProps {
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  scrollOffset?: number;
}

export function InfiniteScroll({
  loadMore,
  hasMore,
  isLoading,
  children,
  loadingText = 'Loading more items...',
  className,
  scrollOffset = 300,
}: InfiniteScrollProps) {
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoadingMore(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `0px 0px ${scrollOffset}px 0px`,
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        loadMore();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loadMore, loadingMore, scrollOffset]);

  return (
    <div className={cn('w-full', className)}>
      {children}
      {hasMore && (
        <div
          ref={loaderRef}
          className={cn(
            'w-full py-4 flex items-center justify-center',
            loadingMore ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-muted-foreground">{loadingText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
