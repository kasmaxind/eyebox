import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchVideos } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";
import SearchFilters from "../components/SearchFilters.jsx";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [result, setResult] = useState({ videos: [], facets: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    const filters = Object.fromEntries(params.entries());
    searchVideos(filters)
      .then((d) => alive && setResult(d))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [params, tick]);

  return (
    <main className="page search-page">
      <div className="search-layout">
        <SearchFilters facets={result.facets} onChange={() => setTick((t) => t + 1)} />
        <div className="search-results">
          <div className="page-hero">
            <h1>{q ? `Search: “${q}”` : "Search"}</h1>
            <p>{result.videos?.length || 0} results</p>
          </div>
          {loading && <div className="loading">Searching…</div>}
          {error && <div className="error">{error}</div>}
          <div className="video-grid">
            {(result.videos || []).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
