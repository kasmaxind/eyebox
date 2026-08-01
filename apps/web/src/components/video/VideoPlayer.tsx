'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onReady?: (player: Player) => void;
}

export default function VideoPlayer({ src, poster, className, onReady }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      responsive: true,
      playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2],
      poster,
      sources: [{ src, type: 'video/mp4' }],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'playbackRateMenuButton',
          'qualitySelector',
          'fullscreenToggle',
        ],
      },
    });

    playerRef.current = player;
    onReady?.(player);

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster, onReady]);

  return (
    <div className={cn('video-player-wrapper rounded-xl overflow-hidden', className)}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-city"
          playsInline
        />
      </div>
      <style jsx global>{`
        .video-player-wrapper .video-js {
          background-color: #070A12;
          border-radius: 0.75rem;
        }
        .video-player-wrapper .vjs-big-play-button {
          background-color: rgba(0, 229, 255, 0.2) !important;
          border: 2px solid #00E5FF !important;
          border-radius: 50% !important;
          width: 72px !important;
          height: 72px !important;
          line-height: 68px !important;
          font-size: 2.5em !important;
        }
        .video-player-wrapper .vjs-big-play-button:hover {
          background-color: rgba(0, 229, 255, 0.4) !important;
        }
        .video-player-wrapper .vjs-play-progress,
        .video-player-wrapper .vjs-volume-level {
          background-color: #00E5FF !important;
        }
        .video-player-wrapper .vjs-slider-bar {
          background-color: rgba(0, 229, 255, 0.3) !important;
        }
        .video-player-wrapper .vjs-control-bar {
          background: linear-gradient(transparent, rgba(7, 10, 18, 0.9)) !important;
        }
      `}</style>
    </div>
  );
}
