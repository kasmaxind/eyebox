import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchExplore, fetchTrending } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";
import VideoRow from "../components/VideoRow.jsx";

export default function Explore() {
  const [trending, setTrending] = useState([]);
  const [explore, setExplore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTrending(), fetchExplore()])
      .then(([t, e]) => {
        setTrending(t.videos || []);
        setExplore(e);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="page"><div className="loading">Loading explore…</div></main>;

  return (
    <main className="page">
      <div className="page-hero">
        <div>
          <h1>Explore</h1>
          <p>Trending videos and top picks across every category.</p>
        </div>
        <Link to="/shorts" className="btn btn-ghost">Shorts feed →</Link>
      </div>

      <VideoRow title="Trending now" videos={trending} badge="Hot" />

      <div className="category-grid">
        {(explore?.categories || []).filter((c) => c !== "All").map((cat) => (
          <Link key={cat} to={`/browse/${encodeURIComponent(cat)}`} className="category-tile">
            {cat}
          </Link>
        ))}
      </div>

      {(explore?.sections || []).map((section) => (
        <VideoRow
          key={section.category}
          title={section.category}
          videos={section.videos}
          href={`/browse/${encodeURIComponent(section.category)}`}
        />
      ))}
    </main>
  );
}
