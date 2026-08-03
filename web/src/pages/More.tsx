import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { VideoGrid } from '../components/VideoCard';
import { useAuth } from '../lib/auth';
import { api, mediaUrl } from '../lib/api';
import type { Notification, Playlist, User, Video } from '../lib/types';

export function ChannelPage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState<(User & { subscribers: number; videoCount: number; subscribed: boolean }) | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    api<{ channel: typeof channel; videos: Video[] }>(`/api/users/${username}`)
      .then((r) => {
        setChannel(r.data.channel);
        setVideos(r.data.videos);
      })
      .catch((e) => setError(e.message));
  }, [username]);

  async function toggleSub() {
    if (!channel || !user) return;
    const res = await api<{ subscribed: boolean }>(`/api/users/${channel.username}/subscribe`, { method: 'POST' });
    setChannel({ ...channel, subscribed: res.data.subscribed, subscribers: channel.subscribers + (res.data.subscribed ? 1 : -1) });
  }

  if (error) return <Layout><div className="toast-error">{error}</div></Layout>;
  if (!channel) return <Layout><div className="empty">Loading channel…</div></Layout>;

  return (
    <Layout>
      <div className="panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="avatar" style={{ width: 72, height: 72, fontSize: '1.5rem' }}>
          {channel.avatar ? <img src={mediaUrl('avatars', channel.avatar)!} alt="" /> : channel.displayName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{channel.displayName}</h2>
          <div className="muted">@{channel.username} · {channel.subscribers} subscribers · {channel.videoCount} videos</div>
          <p style={{ marginBottom: 0 }}>{channel.bio}</p>
        </div>
        {user && user.id !== channel.id && (
          <button className="btn btn-primary" type="button" onClick={() => void toggleSub()}>
            {channel.subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>
      <VideoGrid videos={videos} />
    </Layout>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!q) return;
    api<{ videos: Video[]; users: User[] }>(`/api/users/search?q=${encodeURIComponent(q)}`)
      .then((r) => {
        setVideos(r.data.videos);
        setUsers(r.data.users);
      })
      .catch(() => undefined);
  }, [q]);

  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Search: {q}</h2>
      {users.length > 0 && (
        <>
          <h3>Channels</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {users.map((u) => (
              <Link key={u.id} to={`/c/${u.username}`} className="chip">{u.displayName} (@{u.username})</Link>
            ))}
          </div>
        </>
      )}
      <VideoGrid videos={videos} />
    </Layout>
  );
}

export function LibraryPage() {
  const { user } = useAuth();
  const [later, setLater] = useState<Video[]>([]);
  useEffect(() => {
    if (!user) return;
    api<Video[]>('/api/users/me/watch-later').then((r) => setLater(r.data)).catch(() => undefined);
  }, [user]);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Library</h2>
      <p className="muted">Watch later and saved playlists.</p>
      <h3>Watch later</h3>
      <VideoGrid videos={later} />
      <p style={{ marginTop: '1.5rem' }}><Link className="btn btn-ghost" to="/playlists">Manage playlists</Link></p>
    </Layout>
  );
}

export function HistoryPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  useEffect(() => {
    if (!user) return;
    api<Video[]>('/api/users/me/history').then((r) => setVideos(r.data)).catch(() => undefined);
  }, [user]);
  async function clear() {
    await api('/api/users/me/history', { method: 'DELETE' });
    setVideos([]);
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>History</h2>
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => void clear()}>Clear</button>
      </div>
      <VideoGrid videos={videos} />
    </Layout>
  );
}

export function StudioPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  useEffect(() => {
    if (!user) return;
    api<Video[]>('/api/videos/mine').then((r) => setVideos(r.data)).catch(() => undefined);
  }, [user]);
  async function remove(id: string) {
    if (!confirm('Delete this video?')) return;
    await api(`/api/videos/${id}`, { method: 'DELETE' });
    setVideos((v) => v.filter((x) => x.id !== id));
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Creator Studio</h2>
      <Link className="btn btn-primary btn-sm" to="/upload">New upload</Link>
      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {videos.map((v) => (
          <div key={v.id} className="panel" style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: '1rem', alignItems: 'center' }}>
            <div className="thumb-wrap">
              {v.thumbnail && <img src={mediaUrl('thumbs', v.thumbnail)!} alt="" />}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{v.title}</div>
              <div className="muted">
                {v.visibility}{v.isEncrypted ? ' · E2E' : ''} · {v.views} views · {v.likesCount} likes
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link className="btn btn-ghost btn-sm" to={`/watch/${v.id}`}>Open</Link>
              <button className="btn btn-danger btn-sm" type="button" onClick={() => void remove(v.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!videos.length && <div className="empty">No uploads yet.</div>}
      </div>
    </Layout>
  );
}

export function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [title, setTitle] = useState('');
  useEffect(() => {
    if (!user) return;
    api<Playlist[]>('/api/playlists').then((r) => setPlaylists(r.data)).catch(() => undefined);
  }, [user]);
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await api<Playlist>('/api/playlists', { method: 'POST', body: JSON.stringify({ title }) });
    setPlaylists([res.data, ...playlists]);
    setTitle('');
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Playlists</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New playlist name"
          style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--line)', borderRadius: 12, padding: '0.65rem 0.9rem' }}
          required
        />
        <button className="btn btn-primary" type="submit">Create</button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {playlists.map((p) => (
          <Link key={p.id} to={`/playlists/${p.id}`} className="panel" style={{ display: 'block' }}>
            <strong>{p.title}</strong>
            <div className="muted">{p.videoCount || 0} videos · {p.visibility}</div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}

export function PlaylistDetailPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  useEffect(() => {
    if (!id) return;
    api<Playlist>(`/api/playlists/${id}`).then((r) => setPlaylist(r.data)).catch(() => undefined);
  }, [id]);
  if (!playlist) return <Layout><div className="empty">Loading…</div></Layout>;
  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>{playlist.title}</h2>
      <p className="muted">{playlist.description}</p>
      <VideoGrid videos={playlist.videos || []} />
    </Layout>
  );
}

export function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  useEffect(() => {
    if (!user) return;
    api<Notification[]>('/api/notifications')
      .then(async (r) => {
        setItems(r.data);
        await api('/api/notifications/read', { method: 'POST', body: '{}' });
      })
      .catch(() => undefined);
  }, [user]);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Notifications</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((n) => (
          <Link key={n.id} to={n.link || '/home'} className="panel" style={{ display: 'block', opacity: n.read ? 0.7 : 1 }}>
            <strong>{n.title}</strong>
            <div className="muted">{n.body}</div>
          </Link>
        ))}
        {!items.length && <div className="empty">You're all caught up.</div>}
      </div>
    </Layout>
  );
}
