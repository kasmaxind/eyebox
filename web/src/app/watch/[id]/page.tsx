"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { CommentSection } from "@/components/comments/CommentSection";
import { VideoCard } from "@/components/feed/VideoCard";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getChannel } from "@/data/channels";
import { getRelated, getVideo } from "@/data/videos";
import { cn, formatRelativeTime, formatViews } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import {
  IconCheck,
  IconDislike,
  IconLike,
  IconShare,
  IconSparkles,
  IconVerified,
  IconClock,
  IconChevronDown,
} from "@/components/ui/Icons";

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const video = getVideo(id);
  const channel = video ? getChannel(video.channelId) : undefined;
  const related = useMemo(() => getRelated(id), [id]);
  const {
    liked,
    disliked,
    watchLater,
    subscribed,
    toggleLike,
    toggleDislike,
    toggleWatchLater,
    toggleSubscribe,
    openMiniPlayer,
    closeMiniPlayer,
  } = useAppStore();
  const [theater, setTheater] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeRef = useRef(0);

  useEffect(() => {
    closeMiniPlayer();
  }, [id, closeMiniPlayer]);

  useEffect(() => {
    const videoId = video?.id;
    return () => {
      if (videoId) openMiniPlayer(videoId, timeRef.current);
    };
  }, [id, video?.id, openMiniPlayer]);

  if (!video || !channel) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Video not found</h1>
        <Link href="/" className="mt-4 inline-block text-accent">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("px-3 py-4 md:px-6", theater && "md:px-4")}>
      <div className={cn("grid gap-6", theater ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_380px]")}>
        <div>
          <VideoPlayer
            video={video}
            theater={theater}
            onTheaterToggle={() => setTheater((t) => !t)}
            onTimeUpdate={(t) => {
              timeRef.current = t;
            }}
          />

          <h1 className="mt-4 font-[family-name:var(--font-outfit)] text-xl font-semibold tracking-tight md:text-2xl">
            {video.title}
          </h1>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/channel/${channel.handle}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={channel.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
              </Link>
              <div>
                <Link href={`/channel/${channel.handle}`} className="inline-flex items-center gap-1 font-semibold">
                  {channel.name}
                  {channel.verified && <IconVerified />}
                </Link>
                <p className="text-xs text-text-muted">{formatViews(channel.subscribers)} subscribers</p>
              </div>
              <button
                type="button"
                className="pill-btn ml-2"
                data-variant={subscribed.has(channel.id) ? undefined : "invert"}
                onClick={() => toggleSubscribe(channel.id)}
              >
                {subscribed.has(channel.id) ? (
                  <>
                    <IconCheck size={16} /> Subscribed
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-full bg-bg-chip">
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-bg-hover",
                    liked.has(video.id) && "text-accent",
                  )}
                  onClick={() => toggleLike(video.id)}
                >
                  <IconLike size={18} /> {formatViews(video.likes + (liked.has(video.id) ? 1 : 0))}
                </button>
                <span className="w-px self-stretch bg-border" />
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center px-3 py-2.5 hover:bg-bg-hover",
                    disliked.has(video.id) && "text-accent",
                  )}
                  onClick={() => toggleDislike(video.id)}
                  aria-label="Dislike"
                >
                  <IconDislike size={18} />
                </button>
              </div>
              <button
                type="button"
                className="pill-btn"
                onClick={async () => {
                  await navigator.clipboard?.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                <IconShare size={16} /> {copied ? "Copied" : "Share"}
              </button>
              <button
                type="button"
                className="pill-btn"
                onClick={() => toggleWatchLater(video.id)}
              >
                <IconClock size={16} /> {watchLater.has(video.id) ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-bg-elevated p-4">
            <p className="text-sm font-semibold">
              {video.isLive
                ? `${formatViews(video.liveViewers ?? video.views)} watching now`
                : `${formatViews(video.views)} views · ${formatRelativeTime(video.publishedAt)}`}
            </p>
            <button
              type="button"
              className="mt-2 flex w-full items-start justify-between gap-3 text-left text-sm text-text-muted"
              onClick={() => setDescOpen((o) => !o)}
            >
              <p className={cn("whitespace-pre-wrap", !descOpen && "line-clamp-2")}>{video.description}</p>
              <IconChevronDown size={18} className={cn("shrink-0 transition", descOpen && "rotate-180")} />
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              {video.tags.map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="chip text-xs">
                  #{t}
                </Link>
              ))}
              <span className="chip text-xs">
                <IconSparkles size={12} /> AI chapters {video.chapters ? "ready" : "unavailable"}
              </span>
            </div>
          </div>

          <CommentSection videoId={video.id} />
        </div>

        <aside className={cn(theater && "xl:max-w-3xl xl:mx-auto xl:w-full")}>
          <p className="mb-3 text-sm font-semibold text-text-muted">Up next</p>
          <div className="flex flex-col gap-2">
            {related.map((v) => (
              <VideoCard key={v.id} video={v} horizontal />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
