import { Hero } from "@/components/Hero";
import { VideoRail } from "@/components/VideoRail";
import { catalog } from "@/lib/catalog";

export default function HomePage() {
  const featured = catalog.filter((v) => v.featured);
  const hero = featured[0] ?? catalog[0];
  const trending = [...catalog].sort((a, b) => b.views - a.views).slice(0, 4);
  const fresh = [...catalog]
    .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
    .slice(0, 4);
  const electronic = catalog.filter((v) => v.genre === "Electronic");

  return (
    <>
      <Hero video={hero} />
      <VideoRail
        title="Trending now"
        subtitle="What people are watching on Eyebox."
        videos={trending}
      />
      <VideoRail
        title="Fresh drops"
        subtitle="Newly released official visuals."
        videos={fresh}
      />
      <VideoRail
        title="Electronic pulse"
        subtitle="Synths, voltage, and night drives."
        videos={electronic}
      />
    </>
  );
}
