'use client';

import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { X, Play, Pause, Maximize2 } from 'lucide-react';
import { setIsPlaying, clearPlayer } from '@/store/slices/playerSlice';
import type { RootState } from '@/store';
import { formatDuration } from '@/lib/utils';

export default function MiniPlayer() {
  const dispatch = useDispatch();
  const { currentVideo, isPlaying, isMiniPlayer } = useSelector((state: RootState) => state.player);

  if (!currentVideo || !isMiniPlayer) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 right-4 z-40 w-80 rounded-xl overflow-hidden bg-void-100 border border-glass-border shadow-2xl backdrop-blur-xl">
      <div className="relative aspect-video">
        <Image src={currentVideo.thumbnail} alt={currentVideo.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-void/30 flex items-center justify-center gap-3">
          <button
            onClick={() => dispatch(setIsPlaying(!isPlaying))}
            className="p-2 rounded-full bg-cyan/20 border border-cyan/40 text-cyan hover:bg-cyan/30"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Link
            href={`/watch/${currentVideo.id}`}
            className="p-1.5 rounded-lg bg-void/60 text-white/70 hover:text-white"
          >
            <Maximize2 size={14} />
          </Link>
          <button
            onClick={() => dispatch(clearPlayer())}
            className="p-1.5 rounded-lg bg-void/60 text-white/70 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-white truncate">{currentVideo.title}</p>
        <p className="text-xs text-white/50">{currentVideo.channel.name}</p>
      </div>
    </div>
  );
}
