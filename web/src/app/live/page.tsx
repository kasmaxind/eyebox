"use client";

import { VideoCard } from "@/components/feed/VideoCard";
import { videos } from "@/data/videos";
import { IconLive } from "@/components/ui/Icons";

export default function LivePage() {
  const live = videos.filter((v) => v.isLive);
  const upcoming = videos.filter((v) => v.category === "Live" || v.category === "Gaming").slice(0, 6);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-live text-white">
          <IconLive />
        </span>
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">Live</h1>
          <p className="text-sm text-text-muted">Streams happening now and upcoming gaming desks</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">On air</h2>
        {live.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {live.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No live streams at the moment.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recommended live rooms</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>
    </div>
  );
}
