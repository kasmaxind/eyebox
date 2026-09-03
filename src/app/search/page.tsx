import { VideoCard } from "@/components/VideoCard";
import { catalog } from "@/lib/catalog";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const needle = query.toLowerCase();
  const videos = needle
    ? catalog.filter((v) => {
        const hay =
          `${v.title} ${v.artist} ${v.genre} ${v.tags.join(" ")} ${v.description}`.toLowerCase();
        return hay.includes(needle);
      })
    : [];

  return (
    <>
      <header className="page-head">
        <h1>Search</h1>
        <p>
          {query
            ? `Results for “${query}”`
            : "Type a query in the search bar to find music videos."}
        </p>
      </header>

      {query && videos.length === 0 ? (
        <p className="empty">No matches. Try an artist, genre, or tag.</p>
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
