import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories, fetchVideos } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const sort = params.get("sort") || "latest";
  const category = params.get("category") || "All";

  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories()
      .then((d) => setCategories(d.categories || ["All"]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetchVideos({ q, category, sort })
      .then((d) => {
        if (alive) setVideos(d.videos || []);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [q, category, sort]);

  function setCategory(next) {
    const p = new URLSearchParams(params);
    if (next === "All") p.delete("category");
    else p.set("category", next);
    setParams(p);
  }

  return (
    <main className="page">
      <div className="page-hero">
        <div>
          <h1>{q ? `Results for “${q}”` : "Watch anything"}</h1>
          <p>
            Free self-hosted streaming with Range-request playback. Browse demos
            or upload your own clips.
          </p>
        </div>
      </div>

      <div className="chips" role="tablist" aria-label="Categories">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Loading stream library…</div>}
      {error && (
        <div className="error">
          Couldn’t reach the streaming server. Is it running on port 4000?
          <br />
          {error}
        </div>
      )}
      {!loading && !error && videos.length === 0 && (
        <div className="empty">No videos yet. Upload one to get started.</div>
      )}
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </main>
  );
}
