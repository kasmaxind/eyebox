import { useSearchParams } from "react-router-dom";

export default function SearchFilters({ facets, onChange }) {
  const [params, setParams] = useSearchParams();

  function set(key, value) {
    const p = new URLSearchParams(params);
    if (!value || value === "All") p.delete(key);
    else p.set(key, value);
    setParams(p);
    onChange?.();
  }

  return (
    <aside className="search-filters">
      <h2>Filters</h2>

      <label className="filter-group">
        <span>Sort by</span>
        <select value={params.get("sort") || "latest"} onChange={(e) => set("sort", e.target.value)}>
          {(facets?.sorts || ["latest", "popular", "liked", "trending"]).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-group">
        <span>Category</span>
        <select value={params.get("category") || "All"} onChange={(e) => set("category", e.target.value)}>
          <option value="All">All</option>
          {(facets?.categories || []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-group">
        <span>Type</span>
        <select value={params.get("type") || ""} onChange={(e) => set("type", e.target.value)}>
          <option value="">All videos</option>
          <option value="short">Shorts</option>
          <option value="long">Long form</option>
        </select>
      </label>

      <label className="filter-group">
        <span>Upload date</span>
        <select value={params.get("uploadDate") || ""} onChange={(e) => set("uploadDate", e.target.value)}>
          <option value="">Any time</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
      </label>

      <label className="filter-group">
        <span>Duration</span>
        <select value={params.get("duration") || ""} onChange={(e) => set("duration", e.target.value)}>
          <option value="">Any length</option>
          <option value="short">Under 4 min</option>
          <option value="medium">4–20 min</option>
          <option value="long">Over 20 min</option>
        </select>
      </label>

      <button
        type="button"
        className="btn btn-ghost filter-clear"
        onClick={() => {
          const q = params.get("q");
          setParams(q ? new URLSearchParams({ q }) : new URLSearchParams());
        }}
      >
        Clear filters
      </button>
    </aside>
  );
}
