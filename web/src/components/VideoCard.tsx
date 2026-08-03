import { Link } from 'react-router-dom';
import type { Video } from '../lib/types';
import { formatDuration, formatViews, mediaUrl, timeAgo } from '../lib/api';

export function VideoCard({ video, index = 0 }: { video: Video; index?: number }) {
  const thumb = mediaUrl('thumbs', video.thumbnail);
  return (
    <Link
      to={`/watch/${video.id}`}
      className="video-card"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="thumb-wrap">
        {thumb ? <img src={thumb} alt="" loading="lazy" /> : null}
        {video.isEncrypted && <span className="lock-badge">E2E</span>}
        <span className="duration-badge">{formatDuration(video.duration)}</span>
      </div>
      <div className="meta-row">
        <div className="avatar">
          {video.channel?.avatar
            ? <img src={mediaUrl('avatars', video.channel.avatar)!} alt="" />
            : (video.channel?.displayName?.[0] || 'E')}
        </div>
        <div>
          <div className="video-title">{video.title}</div>
          <div className="muted">{video.channel?.displayName}</div>
          <div className="muted">
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function VideoGrid({ videos }: { videos: Video[] }) {
  if (!videos.length) return <div className="empty">No videos yet.</div>;
  return (
    <div className="video-grid">
      {videos.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}
    </div>
  );
}
