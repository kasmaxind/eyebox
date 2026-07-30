import { Link } from "react-router-dom";
import VideoCard from "./VideoCard.jsx";

export default function VideoRow({ title, videos, href, badge, progressMap }) {
  if (!videos?.length) return null;

  return (
    <section className="video-row">
      <div className="video-row-head">
        <h2>
          {title}
          {badge && <span className="video-row-badge">{badge}</span>}
        </h2>
        {href && (
          <Link to={href} className="video-row-link">
            See all
          </Link>
        )}
      </div>
      <div className="video-row-scroll">
        {videos.map((v) => (
          <div key={v.id} className="video-row-item">
            <VideoCard video={v} progress={progressMap?.[v.id]} />
          </div>
        ))}
      </div>
    </section>
  );
}
