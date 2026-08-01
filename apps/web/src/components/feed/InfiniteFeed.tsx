'use client';

import VideoGrid from '@/components/video/VideoGrid';
import { VideoGridSkeleton } from '@/components/ui/Skeleton';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import type { Video } from '@/types';

interface InfiniteFeedProps {
  videos: Video[];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  title?: string;
}

export default function InfiniteFeed({
  videos,
  hasMore,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
  title = 'Recommended for You',
}: InfiniteFeedProps) {
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading: isFetchingNextPage,
  });

  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
        <VideoGridSkeleton />
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <VideoGrid videos={videos} />
      {isFetchingNextPage && <VideoGridSkeleton count={4} />}
      <div ref={sentinelRef} className="h-4" />
    </section>
  );
}
