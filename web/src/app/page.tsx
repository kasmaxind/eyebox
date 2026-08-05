"use client";

import { useMemo, useState } from "react";
import { CategoryChips } from "@/components/feed/CategoryChips";
import { ContinueWatching } from "@/components/feed/ContinueWatching";
import { ShortsRow } from "@/components/feed/ShortsRow";
import { VideoCard } from "@/components/feed/VideoCard";
import { videos } from "@/data/videos";
import type { Category } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { IconSparkles } from "@/components/ui/Icons";

export default function HomePage() {
  const [category, setCategory] = useState<Category>("All");
  const { history, restrictedMode } = useAppStore();

  const filtered = useMemo(() => {
    let list = videos;
    if (restrictedMode) list = list.filter((v) => !v.isLive);
    if (category === "All") return list;
    if (category === "Recently uploaded") {
      return [...list].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    }
    if (category === "Watched") {
      return list.filter((v) => history.includes(v.id));
    }
    return list.filter((v) => v.category === category || (category === "Live" && v.isLive));
  }, [category, history, restrictedMode]);

  const mix = videos.filter((v) => v.category === "Music" || v.category === "Podcasts").slice(0, 4);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <div className="mb-5 sticky top-[var(--topbar-h)] z-20 -mx-3 bg-bg/80 px-3 py-2 backdrop-blur-xl md:-mx-6 md:px-6">
        <CategoryChips value={category} onChange={setCategory} />
      </div>

      <section className="mb-8 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-[var(--hero-from)] via-bg-elevated to-[var(--hero-to)] p-5 md:p-7 fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              <IconSparkles size={14} /> For you mix
            </p>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight md:text-4xl">
              EyeBox
            </h1>
            <p className="mt-2 text-text-muted">
              A personalized shelf of long-form, Shorts, and live sessions — tuned from what you watch.
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {mix.map((v) => (
              <div key={v.id} className="w-40 shrink-0 md:w-44">
                <VideoCard video={v} dense />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContinueWatching />
      <ShortsRow />

      <section>
        <div className="mb-4">
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold tracking-tight">
            {category === "All" ? "Recommended" : category}
          </h2>
          <p className="text-sm text-text-muted">Fresh uploads and picks matched to this feed</p>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-text-muted">
            Nothing in this category yet. Try All or Recently uploaded.
          </p>
        )}
      </section>
    </div>
  );
}
