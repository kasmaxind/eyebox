'use client';

import { useShortsFeed } from '@/lib/hooks/useFeed';
import ShortsPlayer from '@/components/video/ShortsPlayer';
import { VideoGridSkeleton } from '@/components/ui/Skeleton';

export default function ShortsPage() {
  const { data: videos, isLoading } = useShortsFeed();

  if (isLoading) return <VideoGridSkeleton count={1} />;

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6 text-center">Shorts</h1>
      <ShortsPlayer videos={videos ?? []} />
    </div>
  );
}
