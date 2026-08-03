import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { VideoPlayer } from '../components/VideoPlayer';
import { useAuth } from '../lib/auth';
import { api, formatViews, mediaUrl, timeAgo } from '../lib/api';
import type { Comment, Video } from '../lib/types';

export function WatchPage() {
  const { id } = useParams();
  const { user, privateKey } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [v, c] = await Promise.all([
        api<Video>(`/api/videos/${id}`),
        api<Comment[]>(`/api/comments/${id}/comments`),
      ]);
      setVideo(v.data);
      setComments(c.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function toggleLike() {
    if (!video || !user) return;
    const res = await api<{ liked: boolean; likesCount: number }>(`/api/videos/${video.id}/like`, { method: 'POST' });
    setVideo({ ...video, liked: res.data.liked, likesCount: res.data.likesCount });
  }

  async function toggleSub() {
    if (!video?.channel || !user) return;
    const res = await api<{ subscribed: boolean }>(`/api/users/${video.channel.username}/subscribe`, { method: 'POST' });
    setVideo({ ...video, subscribed: res.data.subscribed });
  }

  async function saveLater() {
    if (!video || !user) return;
    await api(`/api/users/me/watch-later/${video.id}`, { method: 'POST' });
  }

  async function postComment(e: FormEvent) {
    e.preventDefault();
    if (!video || !comment.trim()) return;
    const res = await api<Comment>(`/api/comments/${video.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: comment.trim() }),
    });
    setComments([res.data, ...comments]);
    setComment('');
    setVideo({ ...video, commentsCount: video.commentsCount + 1 });
  }

  if (error) {
    return <Layout><div className="toast-error">{error}</div></Layout>;
  }
  if (!video) {
    return <Layout><div className="empty">Loading video…</div></Layout>;
  }

  return (
    <Layout>
      <div className="watch-layout">
        <div>
          <VideoPlayer
            video={video}
            privateKey={privateKey}
            onNeedUnlock={() => setShowUnlock(true)}
          />
          <h1 style={{ margin: '1rem 0 0.35rem', fontSize: '1.35rem' }}>{video.title}</h1>
          <div className="muted" style={{ marginBottom: '1rem' }}>
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
            {video.isEncrypted && <> · <span className="badge-e2e">E2E encrypted</span></>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Link to={`/c/${video.channel?.username}`} className="avatar">
              {video.channel?.avatar
                ? <img src={mediaUrl('avatars', video.channel.avatar)!} alt="" />
                : video.channel?.displayName?.[0]}
            </Link>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 600 }}>{video.channel?.displayName}</div>
              <div className="muted">{video.channel?.subscribers ?? 0} subscribers</div>
            </div>
            {user && (
              <>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => void toggleLike()}>
                  {video.liked ? 'Liked' : 'Like'} · {video.likesCount}
                </button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => void saveLater()}>Watch later</button>
                {user.id !== video.userId && (
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => void toggleSub()}>
                    {video.subscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </>
            )}
          </div>
          <div className="panel" style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{video.description || 'No description.'}</p>
          </div>

          {showUnlock && (
            <div className="panel" style={{ marginBottom: '1rem' }}>
              <p style={{ marginTop: 0 }}>This video is end-to-end encrypted. Unlock your vault on the Security page, then reload.</p>
              <Link className="btn btn-primary btn-sm" to="/security">Open E2E Vault</Link>
            </div>
          )}

          <h3>{video.commentsCount} Comments</h3>
          {user ? (
            <form onSubmit={postComment} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--line)', borderRadius: 12, padding: '0.7rem 0.9rem' }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
              />
              <button className="btn btn-primary" type="submit">Comment</button>
            </form>
          ) : (
            <p className="muted"><Link to="/login">Sign in</Link> to comment.</p>
          )}
          <div className="comment-list">
            {comments.map((c) => (
              <div className="comment" key={c.id}>
                <div className="avatar">{c.author.displayName?.[0]}</div>
                <div>
                  <div><strong>{c.author.displayName}</strong> <span className="muted">{timeAgo(c.createdAt)}</span></div>
                  <div>{c.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="related-list">
          <h3 style={{ marginTop: 0 }}>Up next</h3>
          {(video.related || []).map((r) => (
            <Link key={r.id} to={`/watch/${r.id}`} className="related-item">
              <div className="thumb-wrap">
                {r.thumbnail && <img src={mediaUrl('thumbs', r.thumbnail)!} alt="" />}
              </div>
              <div>
                <div className="video-title">{r.title}</div>
                <div className="muted">{r.channel?.displayName}</div>
                <div className="muted">{formatViews(r.views)} views</div>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </Layout>
  );
}
