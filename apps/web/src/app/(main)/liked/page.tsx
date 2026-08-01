'use client';

import { useLibrary } from '@/lib/hooks/useFeed';
import VideoGrid from '@/components/video/VideoGrid';

export default function LikedPage() {
  const { data: videos, isLoading } = useLibrary('liked');

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Liked Videos</h1>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
