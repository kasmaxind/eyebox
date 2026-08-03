"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { VideoCard } from "@/components/feed/VideoCard";
import { searchVideos } from "@/data/videos";
import { getChannel } from "@/data/channels";
import { IconSearch, IconSparkles } from "@/components/ui/Icons";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [local, setLocal] = useState(q);
  const [filter, setFilter] = useState<"all" | "video" | "short" | "live" | "channel">("all");

  const results = useMemo(() => {
    let list = searchVideos(q);
    if (filter === "short") list = list.filter((v) => v.isShort);
    if (filter === "live") list = list.filter((v) => v.isLive);
    if (filter === "video") list = list.filter((v) => !v.isShort && !v.isLive);
    return list;
  }, [q, filter]);

  const channelHits = useMemo(() => {
    if (!q.trim() || (filter !== "all" && filter !== "channel")) return [];
    const needle = q.toLowerCase();
    return ["ch-nebula", "ch-pulse", "ch-arena", "ch-lens", "ch-daily", "ch-orbit", "ch-circuit", "ch-byte"]
      .map((id) => getChannel(id)!)
      .filter((c) => c.name.toLowerCase().includes(needle) || c.handle.includes(needle));
  }, [q, filter]);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <form
        className="mb-5 flex gap-2 md:hidden"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(local.trim())}`);
        }}
      >
        <div className="relative flex-1">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="h-11 w-full rounded-full border border-border bg-bg-elevated pl-10 pr-4 text-sm outline-none focus:border-accent/50"
            placeholder="Search EyeBox"
          />
        </div>
      </form>

      <div className="mb-4">
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">
          {q ? `Results for “${q}”` : "Search"}
        </h1>
        <p className="mt-1 inline-flex items-center gap-2 text-sm text-text-muted">
          <IconSparkles size={14} /> Filters include Shorts, Live, and channels
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["all", "All"],
            ["video", "Videos"],
            ["short", "Shorts"],
            ["live", "Live"],
            ["channel", "Channels"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className="chip" data-active={filter === id} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {channelHits.length > 0 && (
        <div className="mb-6 space-y-3">
          {channelHits.map((c) => (
            <a
              key={c.id}
              href={`/channel/${c.handle}`}
              className="flex items-center gap-4 rounded-2xl bg-bg-elevated p-4 hover:bg-bg-hover"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-text-muted">@{c.handle} · {c.subscribers.toLocaleString()} subscribers</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {filter !== "channel" && (
        <div className="flex flex-col gap-3">
          {results.map((v) => (
            <VideoCard key={v.id} video={v} horizontal />
          ))}
          {results.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-text-muted">
              No matches. Try another keyword or clear filters.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-muted">Loading search…</div>}>
      <SearchInner />
    </Suspense>
  );
}
