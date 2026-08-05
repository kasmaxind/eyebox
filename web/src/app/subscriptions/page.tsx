"use client";

import Link from "next/link";
import { VideoCard } from "@/components/feed/VideoCard";
import { channels } from "@/data/channels";
import { videos } from "@/data/videos";
import { useAppStore } from "@/lib/store";

export default function SubscriptionsPage() {
  const { subscribed } = useAppStore();
  const subs = channels.filter((c) => subscribed.has(c.id));
  const feed = videos
    .filter((v) => subscribed.has(v.channelId))
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">Subscriptions</h1>
      <p className="mt-1 text-sm text-text-muted">Latest from channels you follow</p>

      <div className="scrollbar-thin mt-5 flex gap-4 overflow-x-auto pb-2">
        {subs.map((c) => (
          <Link key={c.id} href={`/channel/${c.handle}`} className="flex w-20 shrink-0 flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.avatar} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-accent/40" />
            <span className="truncate text-center text-xs">{c.name}</span>
          </Link>
        ))}
        {subs.length === 0 && (
          <p className="text-sm text-text-muted">Subscribe to creators to fill this shelf.</p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {feed.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
