import Link from "next/link";
import type { Video } from "@/lib/types";
import { formatDuration, formatViews } from "@/lib/catalog";

export function VideoCard({
  video,
  index = 0,
}: {
  video: Video;
  index?: number;
}) {
  return (
    <Link
      href={`/watch/${video.id}`}
      className="video-card"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="video-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.posterUrl} alt="" loading="lazy" />
        <span className="video-card__dur">{formatDuration(video.durationSec)}</span>
      </div>
      <div className="video-card__body">
        <h3>{video.title}</h3>
        <p>
          {video.artist} · {video.genre}
        </p>
        <span className="video-card__meta">{formatViews(video.views)} views</span>
      </div>
    </Link>
  );
}
