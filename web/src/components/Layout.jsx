import { useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import { MiniPlayerBar } from "./VideoPlayer.jsx";

export default function Layout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  function toggleSidebar() {
    if (window.matchMedia("(max-width: 960px)").matches) {
      setMobileSidebarOpen((open) => !open);
    } else {
      setSidebarExpanded((expanded) => !expanded);
    }
  }

  function closeMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  return (
    <div className={`app-shell ${sidebarExpanded ? "sidebar-expanded" : "sidebar-mini"}`}>
      <header className="topbar">
        <div className="topbar-start">
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={toggleSidebar}
            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={sidebarExpanded || mobileSidebarOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <Link to="/" className="brand" aria-label="Eyebox home" onClick={closeMobileSidebar}>
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
        </div>

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

      <div className="app-body">
        <Sidebar
          expanded={sidebarExpanded || mobileSidebarOpen}
          mobileOpen={mobileSidebarOpen}
          onNavigate={closeMobileSidebar}
        />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
      <MiniPlayerBar />
    </div>
  );
}
