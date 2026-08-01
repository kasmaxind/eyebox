'use client';

import { use } from 'react';
import VideoGrid from '@/components/video/VideoGrid';
import { demoVideos } from '@/lib/demoData';

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-2">Playlist</h1>
      <p className="text-white/50 mb-6 text-sm">ID: {id}</p>
      <VideoGrid videos={demoVideos.slice(0, 8)} />
    </div>
  );
}
