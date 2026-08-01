'use client';

import { useLiveFeed } from '@/lib/hooks/useFeed';
import VideoGrid from '@/components/video/VideoGrid';

export default function LivePage() {
  const { data: videos, isLoading } = useLiveFeed();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
        <h1 className="text-2xl font-orbitron font-bold text-white">Live Streams</h1>
      </div>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
