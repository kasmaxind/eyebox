import { VideoCard } from "./VideoCard";
import type { Video } from "@/lib/types";

export function VideoRail({
  title,
  subtitle,
  videos,
}: {
  title: string;
  subtitle?: string;
  videos: Video[];
}) {
  if (videos.length === 0) return null;
  return (
    <section className="rail">
      <div className="rail-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="rail-grid">
        {videos.map((video, i) => (
          <VideoCard key={video.id} video={video} index={i} />
        ))}
      </div>
    </section>
  );
}
