import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchVideosBatch } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";
import { useLibrary } from "../hooks/useLibrary.js";
import { toggleWatchLater } from "../lib/library.js";

export default function WatchLaterPage() {
  const lib = useLibrary();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const ids = lib.watchLater.map((w) => w.id);
    if (!ids.length) {
      setVideos([]);
      return;
    }
    fetchVideosBatch(ids).then((d) => {
      const byId = new Map((d.videos || []).map((v) => [v.id, v]));
      setVideos(ids.map((id) => byId.get(id)).filter(Boolean));
    });
  }, [lib.watchLater]);

  return (
    <main className="page">
      <div className="page-hero">
        <h1>Watch Later</h1>
        <p>{lib.watchLater.length} saved videos</p>
      </div>
      {videos.length === 0 ? (
        <div className="empty">Nothing saved yet. <Link to="/">Find videos</Link></div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => (
            <div key={v.id} className="library-card-wrap">
              <VideoCard video={v} />
              <button
                type="button"
                className="btn btn-ghost library-remove"
                onClick={() => toggleWatchLater(v)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
