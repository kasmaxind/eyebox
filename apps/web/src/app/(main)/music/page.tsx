'use client';

import { useCategoryFeed } from '@/lib/hooks/useFeed';
import VideoGrid from '@/components/video/VideoGrid';

export default function MusicPage() {
  const { data: videos, isLoading } = useCategoryFeed('music');
  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Music</h1>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
