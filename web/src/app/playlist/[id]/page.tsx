"use client";

import { use } from "react";
import Link from "next/link";
import { VideoCard } from "@/components/feed/VideoCard";
import { getPlaylist } from "@/data/content";
import { getVideo } from "@/data/videos";
import { formatRelativeTime } from "@/lib/format";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const playlist = getPlaylist(id);
  if (!playlist) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Playlist not found</h1>
        <Link href="/library" className="mt-4 inline-block text-accent">
          Back to library
        </Link>
      </div>
    );
  }

  const items = playlist.videoIds.map((vid) => getVideo(vid)).filter(Boolean);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <div className="mb-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-dim">Playlist · {playlist.visibility}</p>
        <h1 className="mt-1 font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight">
          {playlist.title}
        </h1>
        <p className="mt-2 text-sm text-text-muted">{playlist.description}</p>
        <p className="mt-2 text-xs text-text-dim">
          {items.length} videos · Updated {formatRelativeTime(playlist.updatedAt)}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((v, i) =>
          v ? (
            <div key={v.id} className="flex items-start gap-3">
              <span className="w-6 pt-4 text-sm text-text-dim tabular-nums">{i + 1}</span>
              <div className="flex-1">
                <VideoCard video={v} horizontal />
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
