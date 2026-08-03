"use client";

import Link from "next/link";
import { VideoCard } from "@/components/feed/VideoCard";
import { playlists } from "@/data/content";
import { getVideo } from "@/data/videos";
import { useAppStore } from "@/lib/store";
import { IconClock, IconHistory, IconLike, IconPlaylist } from "@/components/ui/Icons";

export default function LibraryPage() {
  const { history, liked, watchLater } = useAppStore();
  const recent = history.map((id) => getVideo(id)).filter(Boolean).slice(0, 6);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">Library</h1>
      <p className="mt-1 text-sm text-text-muted">History, playlists, and saves in one place</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { href: "/history", label: "History", icon: IconHistory, meta: `${history.length} videos` },
          { href: "/watch-later", label: "Watch later", icon: IconClock, meta: `${watchLater.size} saved` },
          { href: "/liked", label: "Liked videos", icon: IconLike, meta: `${liked.size} liked` },
          { href: "/playlist/pl-weekend", label: "Playlists", icon: IconPlaylist, meta: `${playlists.length} lists` },
        ].map(({ href, label, icon: Icon, meta }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-border bg-bg-elevated p-4 transition hover:bg-bg-hover"
          >
            <Icon />
            <p className="mt-3 font-semibold">{label}</p>
            <p className="text-xs text-text-muted">{meta}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent</h2>
          <Link href="/history" className="text-sm text-text-muted hover:text-text">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {recent.map((v) => v && <VideoCard key={v.id} video={v} />)}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Your playlists</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((pl) => (
            <Link
              key={pl.id}
              href={`/playlist/${pl.id}`}
              className="rounded-2xl border border-border bg-bg-elevated p-4 hover:bg-bg-hover"
            >
              <p className="font-semibold">{pl.title}</p>
              <p className="mt-1 text-sm text-text-muted">
                {pl.videoIds.length} videos · {pl.visibility}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
