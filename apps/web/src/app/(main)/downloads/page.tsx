'use client';

import { useLibrary } from '@/lib/hooks/useFeed';
import VideoGrid from '@/components/video/VideoGrid';
import { Download } from 'lucide-react';

export default function DownloadsPage() {
  const { data: videos, isLoading } = useLibrary('downloads');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Download size={24} className="text-cyan" />
        <h1 className="text-2xl font-orbitron font-bold text-white">Downloads</h1>
      </div>
      <p className="text-white/50 mb-6 text-sm">Available offline with Premium</p>
      <VideoGrid videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
