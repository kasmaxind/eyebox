import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { fetchCategories } from "../api.js";

function Icon({ children }) {
  return (
    <span className="sidebar-icon" aria-hidden="true">
      {children}
    </span>
  );
}

const icons = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  explore: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 18V8m0 10h4m12-4-4.5 4.5L14 10l-3 3-2.5-2.5L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shorts: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 6h12M8 12h12M8 18h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 6v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  history: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 5v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  clock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  playlist: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 7h14M6 12h10M6 17h10M4 7h.01M4 12h.01M4 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  upload: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 15V5m0 0 4 4m-4-4-4 4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  category: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  sparkle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="m12 3 1.4 4.3L18 9l-4.6 1.7L12 15l-1.4-4.3L6 9l4.6-1.7L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
};

function NavItem({ to, label, icon, active, expanded, onNavigate }) {
  return (
    <Link to={to} className={`sidebar-item ${active ? "active" : ""}`} title={!expanded ? label : undefined} onClick={onNavigate}>
      <Icon>{icon}</Icon>
      {expanded && <span className="sidebar-label">{label}</span>}
    </Link>
  );
}

export default function Sidebar({ expanded, mobileOpen, onNavigate }) {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const category = params.get("category") || "";
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    fetchCategories()
      .then((d) => setCategories(d.categories || ["All"]))
      .catch(() => {});
  }, []);

  const exploreCategories = categories.filter((c) => c !== "All");

  const mainNav = [
    { to: "/", label: "Home", icon: icons.home, active: pathname === "/" },
    { to: "/explore", label: "Explore", icon: icons.explore, active: pathname === "/explore" },
    { to: "/shorts", label: "Shorts", icon: icons.shorts, active: pathname === "/shorts" },
    { to: "/search", label: "Search", icon: icons.search, active: pathname === "/search" },
  ];

  const libraryNav = [
    { to: "/history", label: "History", icon: icons.history },
    { to: "/watch-later", label: "Watch Later", icon: icons.clock },
    { to: "/playlists", label: "Playlists", icon: icons.playlist },
  ];

  return (
    <>
      <div className={`sidebar-backdrop ${mobileOpen ? "open" : ""}`} onClick={onNavigate} aria-hidden="true" />
      <nav className={`sidebar ${expanded ? "expanded" : "mini"} ${mobileOpen ? "mobile-open" : ""}`} aria-label="Primary">
        <div className="sidebar-section">
          {mainNav.map((item) => (
            <NavItem key={item.to} {...item} expanded={expanded} onNavigate={onNavigate} />
          ))}
        </div>

        {expanded && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section">
              <p className="sidebar-heading">Library</p>
              {libraryNav.map((item) => (
                <NavItem key={item.to} {...item} active={pathname === item.to} expanded={expanded} onNavigate={onNavigate} />
              ))}
            </div>
          </>
        )}

        {expanded && exploreCategories.length > 0 && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section">
              <p className="sidebar-heading">Categories</p>
              <NavItem to="/browse" label="All categories" icon={icons.category} active={pathname.startsWith("/browse") && !category} expanded={expanded} onNavigate={onNavigate} />
              {exploreCategories.map((c) => (
                <NavItem
                  key={c}
                  to={`/browse/${encodeURIComponent(c)}`}
                  label={c}
                  icon={icons.category}
                  active={pathname === `/browse/${c}`}
                  expanded={expanded}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </>
        )}

        <div className="sidebar-divider" />
        <div className="sidebar-section">
          <NavItem to="/upload" label="Upload" icon={icons.upload} active={pathname === "/upload"} expanded={expanded} onNavigate={onNavigate} />
        </div>

        {expanded && (
          <>
            <div className="sidebar-divider" />
            <p className="sidebar-footer">Eyebox · AI recommendations</p>
          </>
        )}
      </nav>
    </>
  );
}
