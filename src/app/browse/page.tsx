import Link from "next/link";
import { VideoCard } from "@/components/VideoCard";
import { catalog, genres } from "@/lib/catalog";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre } = await searchParams;
  const active = genre?.trim() ?? "";
  const videos = active
    ? catalog.filter((v) => v.genre.toLowerCase() === active.toLowerCase())
    : catalog;

  return (
    <>
      <header className="page-head">
        <h1>Browse</h1>
        <p>Explore the full Eyebox catalog by genre or mood.</p>
      </header>

      <div className="genre-row" role="list">
        <Link
          href="/browse"
          className={!active ? "chip is-active" : "chip"}
          role="listitem"
        >
          All
        </Link>
        {genres.map((g) => (
          <Link
            key={g}
            href={`/browse?genre=${encodeURIComponent(g)}`}
            className={
              active.toLowerCase() === g.toLowerCase()
                ? "chip is-active"
                : "chip"
            }
            role="listitem"
          >
            {g}
          </Link>
        ))}
      </div>

      {videos.length === 0 ? (
        <p className="empty">No videos in this genre yet.</p>
      ) : (
        <div className="rail-grid">
          {videos.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
