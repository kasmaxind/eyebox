'use client';

import VideoGrid from '@/components/video/VideoGrid';
import { useTrendingFeed } from '@/lib/hooks/useFeed';

export default function TrendingPage() {
  const { data: videos, isLoading } = useTrendingFeed();

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Trending</h1>
      <p className="text-white/50 mb-6">What everyone is watching right now.</p>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
