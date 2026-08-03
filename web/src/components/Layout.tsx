import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { api, mediaUrl } from '../lib/api';

const links = [
  { to: '/home', label: 'Home', icon: '⌂' },
  { to: '/feed', label: 'Subscriptions', icon: '▣' },
  { to: '/trending', label: 'Trending', icon: '↗' },
  { to: '/library', label: 'Library', icon: '▤' },
  { to: '/history', label: 'History', icon: '↺' },
  { to: '/upload', label: 'Upload', icon: '↑' },
  { to: '/studio', label: 'Studio', icon: '✎' },
  { to: '/security', label: 'E2E Vault', icon: '⬡' },
];

export function Layout({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    api<{ count: number }>('/api/notifications/unread-count')
      .then((r) => setUnread(r.data.count))
      .catch(() => undefined);
  }, [user]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to={user ? '/home' : '/'} className="brand">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">EYEBOX</span>
        </Link>
        {!bare && (
          <form className="search-wrap" onSubmit={onSearch}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search videos & channels"
              aria-label="Search"
            />
            <button type="submit">Search</button>
          </form>
        )}
        <div className="top-actions">
          {user ? (
            <>
              <Link className="btn btn-ghost btn-sm" to="/notifications">
                Alerts{unread ? ` (${unread})` : ''}
              </Link>
              <Link className="btn btn-primary btn-sm" to="/upload">Upload</Link>
              <Link to={`/c/${user.username}`} className="avatar" title={user.displayName}>
                {user.avatar ? <img src={mediaUrl('avatars', user.avatar)!} alt="" /> : user.displayName[0]}
              </Link>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => void logout()}>Sign out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm" to="/login">Sign in</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Join</Link>
            </>
          )}
        </div>
      </header>
      {bare ? (
        <main>{children}</main>
      ) : (
        <div className="layout">
          <aside className="sidebar">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <span aria-hidden>{l.icon}</span>
                <span>{l.label}</span>
              </NavLink>
            ))}
            <div className="nav-section">Latest</div>
            <NavLink to="/shorts" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span aria-hidden>▶</span><span>Shorts</span>
            </NavLink>
            <NavLink to="/playlists" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span aria-hidden>☰</span><span>Playlists</span>
            </NavLink>
          </aside>
          <main className="main">{children}</main>
        </div>
      )}
    </div>
  );
}
