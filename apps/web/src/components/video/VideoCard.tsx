'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Video } from '@/types';
import { formatViews, formatDuration, formatRelativeTime } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import LiveBadge from './LiveBadge';

interface VideoCardProps {
  video: Video;
  index?: number;
  layout?: 'grid' | 'horizontal';
}

export default function VideoCard({ video, index = 0, layout = 'grid' }: VideoCardProps) {
  const href = video.isShort ? `/shorts` : `/watch/${video.id}`;

  if (layout === 'horizontal') {
    return (
      <Link href={href} className="flex gap-3 group">
        <div className="relative w-40 sm:w-48 shrink-0 aspect-video rounded-lg overflow-hidden">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="192px"
          />
          {video.isLive && <LiveBadge />}
          {!video.isLive && (
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-void/80 text-[11px] text-white font-medium">
              {formatDuration(video.duration)}
            </span>
          )}
          {video.progress !== undefined && video.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-cyan" style={{ width: `${video.progress * 100}%` }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-cyan transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-white/50 mt-1">{video.channel.name}</p>
          <p className="text-xs text-white/40">
            {formatViews(video.views)} views · {formatRelativeTime(video.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={href} className="group block">
        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {video.isLive && <LiveBadge />}
          {!video.isLive && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-void/80 backdrop-blur-sm text-xs text-white font-medium">
              {formatDuration(video.duration)}
            </span>
          )}
          {video.progress !== undefined && video.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-cyan" style={{ width: `${video.progress * 100}%` }} />
            </div>
          )}
          <div className="absolute inset-0 bg-cyan/0 group-hover:bg-cyan/5 transition-colors duration-300" />
        </div>
        <div className="flex gap-3">
          <Avatar src={video.channel.avatar} name={video.channel.name} size="sm" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-cyan transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-white/50 mt-1">{video.channel.name}</p>
            <p className="text-xs text-white/40">
              {formatViews(video.views)} views · {formatRelativeTime(video.publishedAt)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
