"use client";

import Link from "next/link";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getChannel } from "@/data/channels";
import { shorts } from "@/data/videos";
import { formatViews } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import {
  IconClose,
  IconDislike,
  IconLike,
  IconShare,
  IconVerified,
} from "@/components/ui/Icons";

function ShortsFeed() {
  const params = useSearchParams();
  const startId = params.get("v");
  const ordered = useMemo(() => {
    if (!startId) return shorts;
    const idx = shorts.findIndex((s) => s.id === startId);
    if (idx < 0) return shorts;
    return [...shorts.slice(idx), ...shorts.slice(0, idx)];
  }, [startId]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { liked, toggleLike, toggleDislike, disliked } = useAppStore();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const videos = [...root.querySelectorAll("video")];
    videos.forEach((v, i) => {
      if (i === active) void v.play().catch(() => undefined);
      else v.pause();
    });
  }, [active, ordered]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const onScroll = () => {
      const h = root.clientHeight || 1;
      const idx = Math.round(root.scrollTop / h);
      setActive(Math.min(Math.max(idx, 0), ordered.length - 1));
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [ordered.length]);

  return (
    <div className="relative h-[calc(100vh-var(--topbar-h))] bg-black">
      <Link
        href="/"
        className="absolute left-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white md:left-6"
        aria-label="Close shorts"
      >
        <IconClose />
      </Link>
      <div ref={scrollerRef} className="shorts-snap mx-auto h-full max-w-[420px] overflow-y-auto">
        {ordered.map((short, i) => {
          const channel = getChannel(short.channelId);
          return (
            <section key={short.id} className="relative flex h-full items-center justify-center">
              <video
                src={short.videoUrl}
                poster={short.thumbnail}
                className="h-full w-full object-cover"
                playsInline
                loop
                muted={i !== active}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute bottom-20 left-4 right-20 z-10 text-white md:bottom-10">
                {channel && (
                  <Link
                    href={`/channel/${channel.handle}`}
                    className="pointer-events-auto mb-2 inline-flex items-center gap-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={channel.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                    <span className="font-semibold">@{channel.handle}</span>
                    {channel.verified && <IconVerified />}
                  </Link>
                )}
                <p className="text-sm font-medium leading-snug">{short.title}</p>
                <p className="mt-1 text-xs text-white/70">{formatViews(short.views)} views</p>
              </div>
              <div className="absolute bottom-24 right-3 z-10 flex flex-col items-center gap-4 text-white md:bottom-16">
                <button
                  type="button"
                  className={`pointer-events-auto flex flex-col items-center gap-1 ${liked.has(short.id) ? "text-accent" : ""}`}
                  onClick={() => toggleLike(short.id)}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15">
                    <IconLike />
                  </span>
                  <span className="text-xs">{formatViews(short.likes)}</span>
                </button>
                <button
                  type="button"
                  className={`pointer-events-auto ${disliked.has(short.id) ? "text-accent" : ""}`}
                  onClick={() => toggleDislike(short.id)}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15">
                    <IconDislike />
                  </span>
                </button>
                <button type="button" className="pointer-events-auto flex flex-col items-center gap-1">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15">
                    <IconShare />
                  </span>
                  <span className="text-xs">Share</span>
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function ShortsPage() {
  return (
    <Suspense fallback={<div className="grid h-[60vh] place-items-center text-text-muted">Loading Shorts…</div>}>
      <ShortsFeed />
    </Suspense>
  );
}
