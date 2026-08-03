import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { LandingPage } from './pages/Landing';
import { LoginPage, RegisterPage } from './pages/Auth';
import { HomePage, FeedPage, ShortsPage } from './pages/Home';
import { WatchPage } from './pages/Watch';
import { UploadPage } from './pages/Upload';
import { SecurityPage } from './pages/Security';
import {
  ChannelPage,
  SearchPage,
  LibraryPage,
  HistoryPage,
  StudioPage,
  PlaylistsPage,
  PlaylistDetailPage,
  NotificationsPage,
} from './pages/More';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="empty">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/trending" element={<HomePage sort="trending" />} />
      <Route path="/shorts" element={<ShortsPage />} />
      <Route path="/watch/:id" element={<WatchPage />} />
      <Route path="/c/:username" element={<ChannelPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/feed" element={<RequireAuth><FeedPage /></RequireAuth>} />
      <Route path="/upload" element={<RequireAuth><UploadPage /></RequireAuth>} />
      <Route path="/security" element={<RequireAuth><SecurityPage /></RequireAuth>} />
      <Route path="/library" element={<RequireAuth><LibraryPage /></RequireAuth>} />
      <Route path="/history" element={<RequireAuth><HistoryPage /></RequireAuth>} />
      <Route path="/studio" element={<RequireAuth><StudioPage /></RequireAuth>} />
      <Route path="/playlists" element={<RequireAuth><PlaylistsPage /></RequireAuth>} />
      <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
      <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
