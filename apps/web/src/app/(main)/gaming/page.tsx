'use client';

import { useCategoryFeed } from '@/lib/hooks/useFeed';
import VideoGrid from '@/components/video/VideoGrid';

export default function GamingPage() {
  const { data: videos, isLoading } = useCategoryFeed('gaming');
  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Gaming</h1>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
