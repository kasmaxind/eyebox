"use client";

import { VideoCard } from "@/components/feed/VideoCard";
import { videos } from "@/data/videos";
import { IconTrending } from "@/components/ui/Icons";

export default function TrendingPage() {
  const trending = [...videos].sort((a, b) => b.views - a.views);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white">
          <IconTrending />
        </span>
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">Trending</h1>
          <p className="text-sm text-text-muted">What the EyeBox feed is watching right now</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {trending.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
