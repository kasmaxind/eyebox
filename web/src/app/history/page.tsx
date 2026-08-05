"use client";

import { VideoCard } from "@/components/feed/VideoCard";
import { getVideo } from "@/data/videos";
import { useAppStore } from "@/lib/store";
import { IconClose } from "@/components/ui/Icons";

export default function HistoryPage() {
  const { history, clearHistory, removeHistory } = useAppStore();
  const items = history.map((id) => getVideo(id)).filter(Boolean);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-text-muted">Videos you recently opened</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            className="pill-btn text-sm"
            onClick={() => {
              if (confirm("Clear all watch history?")) clearHistory();
            }}
          >
            Clear all
          </button>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {items.map(
          (v) =>
            v && (
              <div key={v.id} className="group relative flex items-start gap-1">
                <div className="min-w-0 flex-1">
                  <VideoCard video={v} horizontal />
                </div>
                <button
                  type="button"
                  className="icon-btn mt-2 h-9 w-9 shrink-0 opacity-70 hover:opacity-100"
                  aria-label="Remove from history"
                  onClick={() => removeHistory(v.id)}
                >
                  <IconClose size={16} />
                </button>
              </div>
            ),
        )}
        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-text-muted">
            Watch something and it will show up here.
          </p>
        )}
      </div>
    </div>
  );
}
