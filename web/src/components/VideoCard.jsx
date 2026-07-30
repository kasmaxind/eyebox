import { Link } from "react-router-dom";
import { formatDuration, formatViews, timeAgo } from "../api.js";

export default function VideoCard({ video, style }) {
  return (
    <Link to={`/watch/${video.id}`} className="video-card" style={style}>
      <div className="thumb-wrap">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" loading="lazy" />
        ) : (
          <div className="thumb-fallback" />
        )}
        <span className="duration">{formatDuration(video.duration)}</span>
      </div>
      <div className="card-meta">
        <div
          className="avatar"
          style={{ background: video.channel?.avatarColor || "#2EE6A6" }}
          aria-hidden="true"
        >
          {(video.channel?.name || "?").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h3>{video.title}</h3>
          <div className="sub">
            {video.channel?.name}
            <br />
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}
