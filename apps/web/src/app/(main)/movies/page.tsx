'use client';

import { useCategoryFeed } from '@/lib/hooks/useFeed';
import VideoGrid from '@/components/video/VideoGrid';

export default function MoviesPage() {
  const { data: videos, isLoading } = useCategoryFeed('movies');
  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Movies</h1>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
