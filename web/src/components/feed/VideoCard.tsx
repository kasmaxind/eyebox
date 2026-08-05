"use client";

import Link from "next/link";
import { getChannel } from "@/data/channels";
import type { Video } from "@/lib/types";
import { cn, formatDuration, formatRelativeTime, formatViews } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { IconVerified } from "@/components/ui/Icons";

function watchHref(video: Video) {
  return video.isShort ? `/shorts?v=${video.id}` : `/watch/${video.id}`;
}

export function VideoCard({
  video,
  dense = false,
  horizontal = false,
}: {
  video: Video;
  dense?: boolean;
  horizontal?: boolean;
}) {
  const channel = getChannel(video.channelId);
  const { progress } = useAppStore();
  const watched = progress[video.id] ?? video.progress ?? 0;
  const href = watchHref(video);

  if (horizontal) {
    return (
      <Link href={href} className="group flex gap-3 rounded-xl p-1 transition hover:bg-bg-hover/60">
        <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-bg-chip sm:w-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          {video.isLive ? (
            <span className="absolute bottom-1.5 left-1.5 rounded bg-live px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Live
            </span>
          ) : video.isShort ? (
            <span className="absolute bottom-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Shorts
            </span>
          ) : (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
              {formatDuration(video.duration)}
            </span>
          )}
          {watched > 0.02 && watched < 0.97 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
              <div className="progress-bar h-full" style={{ width: `${watched * 100}%` }} />
            </div>
          )}
        </div>
        <div className="min-w-0 py-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{video.title}</h3>
          <p className="mt-1 truncate text-xs text-text-muted">{channel?.name}</p>
          <p className="text-xs text-text-dim">
            {video.isLive
              ? `${formatViews(video.liveViewers ?? video.views)} watching`
              : `${formatViews(video.views)} views · ${formatRelativeTime(video.publishedAt)}`}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <article className={cn("group slide-up", dense && "text-sm")}>
      <Link href={href} className="block">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-bg-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />
          {video.isLive ? (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-live px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
              Live
            </span>
          ) : video.isShort ? (
            <span className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide">
              Shorts
            </span>
          ) : (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium tabular-nums">
              {formatDuration(video.duration)}
            </span>
          )}
          {watched > 0.02 && watched < 0.97 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
              <div className="progress-bar h-full" style={{ width: `${watched * 100}%` }} />
            </div>
          )}
        </div>
      </Link>
      <div className="mt-3 flex gap-3">
        {channel && (
          <Link href={`/channel/${channel.handle}`} className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={channel.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          </Link>
        )}
        <div className="min-w-0">
          <Link href={href}>
            <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight group-hover:text-text">
              {video.title}
            </h3>
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-text-muted">
            {channel && (
              <Link href={`/channel/${channel.handle}`} className="inline-flex items-center gap-1 hover:text-text">
                {channel.name}
                {channel.verified && <IconVerified className="text-text-muted" />}
              </Link>
            )}
          </div>
          <p className="text-sm text-text-dim">
            {video.isLive
              ? `${formatViews(video.liveViewers ?? video.views)} watching`
              : `${formatViews(video.views)} views · ${formatRelativeTime(video.publishedAt)}`}
          </p>
        </div>
      </div>
    </article>
  );
}
