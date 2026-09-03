import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoRail } from "@/components/VideoRail";
import { catalog } from "@/lib/catalog";
import { readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = catalog.find((v) => v.id === id);
  if (!video) notFound();

  const related = catalog
    .filter(
      (v) =>
        v.id !== video.id &&
        (v.genre === video.genre ||
          v.tags.some((t) => video.tags.includes(t)))
    )
    .slice(0, 4);

  const state = await readState();

  return (
    <>
      <p style={{ margin: "1rem 0 0", color: "var(--ink-soft)" }}>
        <Link href="/browse">Browse</Link> / {video.title}
      </p>
      <VideoPlayer
        video={video}
        favorites={state.favorites}
        playlists={state.playlists}
      />
      <VideoRail
        title="More like this"
        subtitle="Related visuals from nearby sounds and genres."
        videos={related}
      />
    </>
  );
}
