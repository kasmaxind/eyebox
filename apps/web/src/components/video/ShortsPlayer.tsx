'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import type { Video } from '@/types';
import { formatViews } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';

interface ShortsPlayerProps {
  videos: Video[];
}

export default function ShortsPlayer({ videos }: ShortsPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = videos[currentIndex];

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        if (currentIndex < videos.length - 1) setCurrentIndex((i) => i + 1);
      } else {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      }
    };
    const el = containerRef.current;
    el?.addEventListener('wheel', handleWheel, { passive: false });
    return () => el?.removeEventListener('wheel', handleWheel);
  }, [currentIndex, videos.length]);

  if (!current) return null;

  const goNext = () => {
    if (currentIndex < videos.length - 1) setCurrentIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  return (
    <div ref={containerRef} className="relative h-[calc(100vh-8rem)] max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="relative h-full rounded-2xl overflow-hidden bg-void-100"
        >
          <Image
            src={current.thumbnail}
            alt={current.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/30" />

          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
            <button className="flex flex-col items-center gap-1 text-white">
              <div className="p-2.5 rounded-full bg-glass border border-glass-border backdrop-blur-sm">
                <Heart size={22} />
              </div>
              <span className="text-xs">{formatViews(current.likes)}</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <div className="p-2.5 rounded-full bg-glass border border-glass-border backdrop-blur-sm">
                <MessageCircle size={22} />
              </div>
              <span className="text-xs">Reply</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white">
              <div className="p-2.5 rounded-full bg-glass border border-glass-border backdrop-blur-sm">
                <Share2 size={22} />
              </div>
              <span className="text-xs">Share</span>
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-glass border border-glass-border backdrop-blur-sm text-white"
            >
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-16">
            <div className="flex items-center gap-2 mb-2">
              <Avatar src={current.channel.avatar} name={current.channel.name} size="sm" />
              <span className="text-sm font-semibold text-white">{current.channel.name}</span>
              <button className="ml-2 px-3 py-1 rounded-full bg-cyan text-void text-xs font-semibold">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-white line-clamp-2">{current.title}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-[-3rem] top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-glass border border-glass-border text-white/70 hover:text-white disabled:opacity-30"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === videos.length - 1}
          className="p-2 rounded-full bg-glass border border-glass-border text-white/70 hover:text-white disabled:opacity-30"
        >
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
}
