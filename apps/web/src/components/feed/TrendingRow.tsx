'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Video } from '@/types';
import VideoCard from '@/components/video/VideoCard';

interface TrendingRowProps {
  videos: Video[];
  title?: string;
}

export default function TrendingRow({ videos, title = 'Trending Now' }: TrendingRowProps) {
  if (!videos.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Link href="/trending" className="text-sm text-cyan hover:text-cyan-dim flex items-center gap-1">
          See all <ChevronRight size={16} />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {videos.map((video, i) => (
          <div key={video.id} className="w-64 shrink-0">
            <VideoCard video={video} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
