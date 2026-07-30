import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchVideos } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";

export default function BrowseCategory() {
  const { category } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filters = category ? { category, sort: "popular" } : { sort: "latest" };
    fetchVideos(filters)
      .then((d) => setVideos(d.videos || []))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <main className="page">
      <div className="page-hero">
        <h1>{category || "All categories"}</h1>
        <p>Category browsing · {videos.length} videos</p>
      </div>
      <div className="chips">
        <Link to="/browse" className={`chip ${!category ? "active" : ""}`}>All</Link>
        {["Film", "Music", "Tech", "Live", "Art"].map((c) => (
          <Link
            key={c}
            to={`/browse/${encodeURIComponent(c)}`}
            className={`chip ${category === c ? "active" : ""}`}
          >
            {c}
          </Link>
        ))}
      </div>
      {loading && <div className="loading">Loading…</div>}
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </main>
  );
}
