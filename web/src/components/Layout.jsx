import { useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Eyebox home">
          <span className="brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <circle cx="12" cy="12" r="3.2" fill="currentColor" />
            </svg>
          </span>
          <span className="word">
            <span className="eye">Eye</span>box
          </span>
        </Link>

        <form className="search-form" onSubmit={onSearch} role="search">
          <input
            type="search"
            placeholder="Search videos, channels…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
          />
          <button type="submit" aria-label="Submit search">
            Search
          </button>
        </form>

        <div className="top-actions">
          <Link className="btn btn-ghost" to="/?sort=popular">
            Popular
          </Link>
          <Link className="btn btn-primary" to="/upload">
            Upload
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
