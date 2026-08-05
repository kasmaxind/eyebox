"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Video } from "@/lib/types";
import { getChannel } from "@/data/channels";
import { formatViews } from "@/lib/format";

function CountdownInner({
  next,
  seconds,
  onCancel,
  onPlay,
}: {
  next: Video;
  seconds: number;
  onCancel: () => void;
  onPlay: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const channel = getChannel(next.channelId);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          onPlay();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [onPlay]);

  return (
    <div className="slide-up mt-3 flex items-center gap-3 rounded-2xl border border-border bg-bg-elevated p-3">
      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-bg-chip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={next.thumbnail} alt="" className="h-full w-full object-cover" />
        <span className="absolute inset-0 grid place-items-center bg-black/40 text-lg font-bold text-white">
          {left}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">Up next</p>
        <Link href={`/watch/${next.id}`} className="line-clamp-1 text-sm font-semibold hover:underline">
          {next.title}
        </Link>
        <p className="text-xs text-text-muted">
          {channel?.name} · {formatViews(next.views)} views
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button type="button" className="pill-btn text-xs" data-variant="accent" onClick={onPlay}>
          Play now
        </button>
        <button type="button" className="pill-btn text-xs" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function UpNextCountdown({
  next,
  seconds = 8,
  onCancel,
  onPlay,
}: {
  next: Video;
  seconds?: number;
  onCancel: () => void;
  onPlay: () => void;
}) {
  return (
    <CountdownInner
      key={`${next.id}-${seconds}`}
      next={next}
      seconds={seconds}
      onCancel={onCancel}
      onPlay={onPlay}
    />
  );
}
