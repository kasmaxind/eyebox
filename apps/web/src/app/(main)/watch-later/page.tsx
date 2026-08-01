'use client';

import { useLibrary } from '@/lib/hooks/useFeed';
import VideoGrid from '@/components/video/VideoGrid';

export default function WatchLaterPage() {
  const { data: videos, isLoading } = useLibrary('watch-later');

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Watch Later</h1>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
