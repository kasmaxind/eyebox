"use client";

import { VideoCard } from "@/components/feed/VideoCard";
import { getVideo } from "@/data/videos";
import { useAppStore } from "@/lib/store";

export default function LikedPage() {
  const { liked } = useAppStore();
  const items = [...liked].map((id) => getVideo(id)).filter(Boolean);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">Liked videos</h1>
      <p className="mt-1 text-sm text-text-muted">{items.length} videos</p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((v) => v && <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  );
}
