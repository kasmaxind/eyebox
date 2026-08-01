'use client';

import Link from 'next/link';
import { History, Clock, ThumbsUp, Download, ListMusic } from 'lucide-react';
import { useLibrary } from '@/lib/hooks/useFeed';
import VideoCard from '@/components/video/VideoCard';

const sections = [
  { key: 'history' as const, label: 'History', icon: History, href: '/history' },
  { key: 'watch-later' as const, label: 'Watch Later', icon: Clock, href: '/watch-later' },
  { key: 'liked' as const, label: 'Liked', icon: ThumbsUp, href: '/liked' },
  { key: 'downloads' as const, label: 'Downloads', icon: Download, href: '/downloads' },
];

export default function LibraryPage() {
  const { data: historyVideos, isLoading } = useLibrary('history');

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Library</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {sections.map((section) => (
          <Link
            key={section.key}
            href={section.href}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl glass-panel hover:border-cyan/20 transition-all"
          >
            <section.icon size={24} className="text-cyan" />
            <span className="text-sm font-medium text-white">{section.label}</span>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ListMusic size={20} /> Recently Watched
          </h2>
          <Link href="/history" className="text-sm text-cyan">See all</Link>
        </div>
        {isLoading ? (
          <p className="text-white/40">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyVideos?.slice(0, 6).map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} layout="horizontal" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
