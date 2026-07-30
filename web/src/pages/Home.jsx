import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories, fetchHomeFeed, fetchVideos } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";
import VideoRow from "../components/VideoRow.jsx";
import { getViewerSignals } from "../lib/library.js";
import { useLibrary } from "../hooks/useLibrary.js";

export default function Home() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const sort = params.get("sort") || "";
  const category = params.get("category") || "All";
  const lib = useLibrary();

  const [sections, setSections] = useState([]);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredMode = !!(q || sort || (category && category !== "All"));

  useEffect(() => {
    fetchCategories()
      .then((d) => setCategories(d.categories || ["All"]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    if (filteredMode) {
      fetchVideos({ q, category, sort: sort || "latest" })
        .then((d) => alive && setVideos(d.videos || []))
        .catch((err) => alive && setError(err.message))
        .finally(() => alive && setLoading(false));
      return () => {
        alive = false;
      };
    }

    const signals = getViewerSignals();
    fetchHomeFeed({
      ...signals,
      continueIds: lib.continueWatching.map((c) => c.id),
      watchLaterIds: lib.watchLater.map((w) => w.id),
    })
      .then((d) => alive && setSections(d.sections || []))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [filteredMode, q, category, sort, lib.continueWatching, lib.watchLater]);

  const progressMap = Object.fromEntries(
    lib.continueWatching.map((c) => [c.id, c.progress])
  );

  if (filteredMode) {
    return (
      <main className="page">
        <div className="page-hero">
          <div>
            <h1>
              {q ? `Results for “${q}”` : sort === "popular" ? "Trending" : category !== "All" ? category : "Browse"}
            </h1>
          </div>
        </div>
        {loading && <div className="loading">Loading…</div>}
        {error && <div className="error">{error}</div>}
        <div className="video-grid">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} progress={progressMap[v.id]} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="page page-home">
      <div className="page-hero">
        <div>
          <h1>Home</h1>
          <p>Your personalized feed — trending, recommendations, and Shorts.</p>
        </div>
      </div>

      <div className="chips" role="tablist" aria-label="Categories">
        {categories.map((c) => (
          <a
            key={c}
            href={c === "All" ? "/browse" : `/browse/${encodeURIComponent(c)}`}
            className={`chip ${category === c ? "active" : ""}`}
          >
            {c}
          </a>
        ))}
      </div>

      {loading && <div className="loading">Building your feed…</div>}
      {error && <div className="error">{error}</div>}

      {sections.map((section) => (
        <VideoRow
          key={section.id}
          title={section.title}
          videos={section.videos}
          href={section.href}
          badge={section.badge}
          progressMap={section.id === "continue" ? progressMap : undefined}
        />
      ))}
    </main>
  );
}
