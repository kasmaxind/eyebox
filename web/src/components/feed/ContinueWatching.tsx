"use client";

import Link from "next/link";
import { videos } from "@/data/videos";
import { useAppStore } from "@/lib/store";
import { formatDuration } from "@/lib/format";

export function ContinueWatching() {
  const { progress, history } = useAppStore();
  const items = history
    .map((id) => videos.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v))
    .filter((v) => {
      const p = progress[v.id] ?? v.progress ?? 0;
      return p > 0.05 && p < 0.95;
    })
    .slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="mb-8 fade-in">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold tracking-tight">
            Continue watching
          </h2>
          <p className="text-sm text-text-muted">Pick up where you left off</p>
        </div>
        <Link href="/history" className="text-sm font-medium text-text-muted hover:text-text">
          See all
        </Link>
      </div>
      <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
        {items.map((video) => {
          const p = progress[video.id] ?? video.progress ?? 0;
          return (
            <Link
              key={video.id}
              href={`/watch/${video.id}`}
              className="group relative w-56 shrink-0 overflow-hidden rounded-2xl bg-bg-elevated sm:w-64"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt=""
                className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{video.title}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
                  <div className="progress-bar h-full" style={{ width: `${p * 100}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-white/70">
                  {Math.round(p * 100)}% · {formatDuration(video.duration)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
