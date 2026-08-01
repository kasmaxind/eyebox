'use client';

import { useLibrary } from '@/lib/hooks/useFeed';
import VideoGrid from '@/components/video/VideoGrid';

export default function HistoryPage() {
  const { data: videos, isLoading } = useLibrary('history');

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">History</h1>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
