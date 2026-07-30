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
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  trending: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 18V8m0 10h4m12-4-4.5 4.5L14 10l-3 3-2.5-2.5L4 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  latest: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  upload: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15V5m0 0 4 4m-4-4-4 4M5 19h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  explore: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14.5 9.5 10 14l-2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  sparkle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="m12 3 1.4 4.3L18 9l-4.6 1.7L12 15l-1.4-4.3L6 9l4.6-1.7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M19 14v3m1.5-1.5H17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  stream: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="m10 9.5 5 3-5 3v-6Z" fill="currentColor" />
    </svg>
  ),
  comment: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H11l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  channel: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const mainNav = [
  { to: "/", label: "Home", icon: icons.home, match: (path, sort) => path === "/" && !sort },
  { to: "/?sort=popular", label: "Popular", icon: icons.trending, match: (_path, sort) => sort === "popular" },
  { to: "/?sort=latest", label: "Latest", icon: icons.latest, match: (_path, sort) => sort === "latest" },
  { to: "/upload", label: "Upload", icon: icons.upload, match: (path) => path === "/upload" },
];

const latestFeatures = [
  {
    to: "/",
    label: "Range streaming",
    hint: "Seek without full download",
    icon: icons.stream,
    badge: "New",
  },
  {
    to: "/upload",
    label: "Drag & drop upload",
    hint: "Up to 2 GB per clip",
    icon: icons.upload,
    badge: "New",
  },
  {
    to: "/watch/dQw9demo001",
    label: "Comments & likes",
    hint: "Engage on watch pages",
    icon: icons.comment,
    badge: "New",
  },
  {
    to: "/channel/lenslab",
    label: "Channel pages",
    hint: "Browse by creator",
    icon: icons.channel,
    badge: "New",
  },
];

function NavItem({ to, label, icon, active, expanded, onNavigate }) {
  return (
    <Link
      to={to}
      className={`sidebar-item ${active ? "active" : ""}`}
      title={!expanded ? label : undefined}
      onClick={onNavigate}
    >
      <Icon>{icon}</Icon>
      {expanded && <span className="sidebar-label">{label}</span>}
    </Link>
  );
}

function FeatureItem({ to, label, hint, icon, badge, expanded, onNavigate }) {
  return (
    <Link
      to={to}
      className="sidebar-feature"
      title={!expanded ? label : undefined}
      onClick={onNavigate}
    >
      <Icon>{icon}</Icon>
      {expanded && (
        <span className="sidebar-feature-text">
          <span className="sidebar-feature-row">
            <span className="sidebar-label">{label}</span>
            {badge && <span className="sidebar-badge">{badge}</span>}
          </span>
          <span className="sidebar-feature-hint">{hint}</span>
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ expanded, mobileOpen, onNavigate }) {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const sort = params.get("sort") || "";
  const category = params.get("category") || "";
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    fetchCategories()
      .then((d) => setCategories(d.categories || ["All"]))
      .catch(() => {});
  }, []);

  const exploreCategories = categories.filter((c) => c !== "All");

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? "open" : ""}`}
        onClick={onNavigate}
        aria-hidden="true"
      />
      <nav
        className={`sidebar ${expanded ? "expanded" : "mini"} ${mobileOpen ? "mobile-open" : ""}`}
        aria-label="Primary"
      >
        <div className="sidebar-section">
          {mainNav.map((item) => (
            <NavItem
              key={item.label}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={item.match(pathname, sort)}
              expanded={expanded}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {expanded && exploreCategories.length > 0 && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section">
              <p className="sidebar-heading">Explore</p>
              {exploreCategories.map((c) => {
                const to = `/?category=${encodeURIComponent(c)}`;
                return (
                  <NavItem
                    key={c}
                    to={to}
                    label={c}
                    icon={icons.explore}
                    active={category === c}
                    expanded={expanded}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </div>
          </>
        )}

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          {expanded && <p className="sidebar-heading">Latest features</p>}
          {latestFeatures.map((f) => (
            <FeatureItem
              key={f.label}
              {...f}
              expanded={expanded}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {expanded && (
          <>
            <div className="sidebar-divider" />
            <p className="sidebar-footer">Eyebox · self-hosted streaming</p>
          </>
        )}
      </nav>
    </>
  );
}
