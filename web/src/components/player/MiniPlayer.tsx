"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getVideo } from "@/data/videos";
import { useAppStore } from "@/lib/store";
import { IconClose, IconPause, IconPlay } from "@/components/ui/Icons";

export function MiniPlayer() {
  const pathname = usePathname();
  const { miniPlayer, closeMiniPlayer, updateMiniPlayer } = useAppStore();
  const ref = useRef<HTMLVideoElement>(null);

  const hideOnWatch = pathname.startsWith("/watch/");
  const video = miniPlayer ? getVideo(miniPlayer.videoId) : null;

  useEffect(() => {
    const el = ref.current;
    if (!el || !miniPlayer || !video) return;
    el.currentTime = miniPlayer.currentTime;
    if (miniPlayer.playing) void el.play().catch(() => undefined);
    else el.pause();
  }, [miniPlayer?.videoId, miniPlayer?.playing, miniPlayer, video]);

  if (!miniPlayer || !video || hideOnWatch) return null;

  return (
    <div className="fixed bottom-16 right-3 z-50 w-[300px] overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[var(--shadow)] scale-in md:bottom-4 md:right-4 md:w-[340px]">
      <div className="relative aspect-video bg-black">
        <video
          ref={ref}
          src={video.videoUrl}
          poster={video.thumbnail}
          className="h-full w-full object-contain"
          playsInline
          onTimeUpdate={() => {
            if (ref.current) updateMiniPlayer({ currentTime: ref.current.currentTime });
          }}
        />
        <div className="absolute inset-x-0 top-0 flex justify-between bg-gradient-to-b from-black/70 to-transparent p-2">
          <Link href={`/watch/${video.id}`} className="rounded-full bg-black/40 px-2 py-1 text-[11px] font-medium text-white">
            Expand
          </Link>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white"
            onClick={closeMiniPlayer}
            aria-label="Close mini player"
          >
            <IconClose size={14} />
          </button>
        </div>
        <button
          type="button"
          className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white"
          onClick={() => updateMiniPlayer({ playing: !miniPlayer.playing })}
          aria-label={miniPlayer.playing ? "Pause" : "Play"}
        >
          {miniPlayer.playing ? <IconPause size={14} /> : <IconPlay size={14} />}
        </button>
      </div>
      <Link href={`/watch/${video.id}`} className="block px-3 py-2.5 hover:bg-bg-hover">
        <p className="line-clamp-1 text-sm font-semibold">{video.title}</p>
        <p className="text-xs text-text-muted">Playing in mini player</p>
      </Link>
    </div>
  );
}
