import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { VideoGrid } from '../components/VideoCard';
import { api } from '../lib/api';
import type { Video } from '../lib/types';

const CATEGORIES = ['All', 'Film', 'Tech', 'Documentary', 'Sports', 'Science', 'Music', 'Gaming'];

export function HomePage({ sort = 'latest' }: { sort?: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [category, setCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, limit: '48' });
    if (category !== 'All') params.set('category', category);
    api<Video[]>(`/api/videos?${params}`)
      .then((r) => setVideos(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, sort]);

  return (
    <Layout>
      <div className="chip-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip${category === c ? ' active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {error && <div className="toast-error">{error}</div>}
      {loading ? <div className="empty">Loading feed…</div> : <VideoGrid videos={videos} />}
    </Layout>
  );
}

export function FeedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Video[]>('/api/videos/feed')
      .then((r) => setVideos(r.data))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Subscriptions</h2>
      {error && <div className="toast-error">{error}</div>}
      <VideoGrid videos={videos} />
    </Layout>
  );
}

export function ShortsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  useEffect(() => {
    api<Video[]>('/api/videos?sort=trending&limit=24')
      .then((r) => setVideos(r.data.filter((v) => v.duration > 0 && v.duration <= 60).concat(r.data).slice(0, 12)))
      .catch(() => undefined);
  }, []);
  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Shorts</h2>
      <p className="muted">Vertical-friendly clips from your free EyeBox library.</p>
      <VideoGrid videos={videos} />
    </Layout>
  );
}
