"use client";

import { VideoCard } from "@/components/feed/VideoCard";
import { getVideo } from "@/data/videos";
import { useAppStore } from "@/lib/store";

export default function HistoryPage() {
  const { history } = useAppStore();
  const items = history.map((id) => getVideo(id)).filter(Boolean);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">History</h1>
      <p className="mt-1 text-sm text-text-muted">Videos you recently opened</p>
      <div className="mt-6 flex flex-col gap-2">
        {items.map((v) => v && <VideoCard key={v.id} video={v} horizontal />)}
        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-text-muted">
            Watch something and it will show up here.
          </p>
        )}
      </div>
    </div>
  );
}
