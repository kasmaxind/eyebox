import { Link } from "react-router-dom";
import { fetchVideosBatch } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";
import { useEffect, useState } from "react";
import { clearHistory, removeFromHistory } from "../lib/library.js";
import { useLibrary } from "../hooks/useLibrary.js";
import { timeAgo } from "../api.js";

export default function History() {
  const lib = useLibrary();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const ids = lib.history.map((h) => h.id);
    if (!ids.length) {
      setVideos([]);
      return;
    }
    fetchVideosBatch(ids).then((d) => {
      const byId = new Map((d.videos || []).map((v) => [v.id, v]));
      setVideos(ids.map((id) => byId.get(id)).filter(Boolean));
    });
  }, [lib.history]);

  return (
    <main className="page">
      <div className="page-hero">
        <div>
          <h1>Watch history</h1>
          <p>{lib.history.length} videos watched</p>
        </div>
        {lib.history.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={clearHistory}>
            Clear all
          </button>
        )}
      </div>
      {videos.length === 0 ? (
        <div className="empty">No watch history yet. <Link to="/">Browse videos</Link></div>
      ) : (
        <div className="library-list">
          {lib.history.map((h) => {
            const v = videos.find((x) => x.id === h.id);
            if (!v) return null;
            return (
              <div key={h.id} className="library-row">
                <VideoCard video={v} />
                <div className="library-row-meta">
                  <span>Watched {timeAgo(h.watchedAt)}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeFromHistory(h.id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
