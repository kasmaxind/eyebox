import type { Video } from '@/types';
import VideoCard from './VideoCard';
import { VideoGridSkeleton } from '@/components/ui/Skeleton';

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
}

export default function VideoGrid({ videos, isLoading }: VideoGridProps) {
  if (isLoading) return <VideoGridSkeleton />;

  if (!videos.length) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40 text-lg">No videos found</p>
        <p className="text-white/25 text-sm mt-2">Check back later for new content</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
      {videos.map((video, i) => (
        <VideoCard key={video.id} video={video} index={i} />
      ))}
    </div>
  );
}
