import { VideoCard } from "@/components/VideoCard";
import { catalog } from "@/lib/catalog";
import { readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const state = await readState();
  const favorites = state.favorites
    .map((id) => catalog.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
  const recent = state.recentlyWatched
    .map((id) => catalog.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  return (
    <>
      <header className="page-head">
        <h1>Library</h1>
        <p>Your saved music videos and recently watched visuals.</p>
      </header>

      <section className="rail">
        <div className="rail-head">
          <h2>Saved</h2>
          <p>{favorites.length} videos</p>
        </div>
        {favorites.length === 0 ? (
          <p className="empty">Save a video from the player to build your library.</p>
        ) : (
          <div className="rail-grid">
            {favorites.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="rail">
        <div className="rail-head">
          <h2>Recently watched</h2>
        </div>
        {recent.length === 0 ? (
          <p className="empty">Play something — it will show up here.</p>
        ) : (
          <div className="rail-grid">
            {recent.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
