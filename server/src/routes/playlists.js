import { Router } from 'express';
import { db, publicVideo } from '../db.js';
import { id } from '../utils/helpers.js';
import { ok, fail } from '../utils/response.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM playlist_videos pv WHERE pv.playlist_id = p.id) AS video_count
    FROM playlists p WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(req.user.id);
  return ok(res, rows.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    visibility: p.visibility,
    videoCount: p.video_count,
    createdAt: p.created_at,
  })));
});

router.post('/', requireAuth, (req, res) => {
  const title = String(req.body.title || '').trim().slice(0, 100);
  if (!title) return fail(res, 400, 'Title required');
  const description = String(req.body.description || '').slice(0, 500);
  const visibility = ['public', 'private'].includes(req.body.visibility) ? req.body.visibility : 'private';
  const playlistId = id('pl');
  db.prepare(`INSERT INTO playlists (id, user_id, title, description, visibility) VALUES (?, ?, ?, ?, ?)`)
    .run(playlistId, req.user.id, title, description, visibility);
  return ok(res, { id: playlistId, title, description, visibility, videoCount: 0 });
});

router.get('/:id', optionalAuth, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return fail(res, 404, 'Playlist not found');
  if (playlist.visibility === 'private' && req.user?.id !== playlist.user_id) {
    return fail(res, 404, 'Playlist not found');
  }
  const videos = db.prepare(`
    SELECT v.*, u.username, u.display_name, u.avatar, pv.position
    FROM playlist_videos pv
    JOIN videos v ON v.id = pv.video_id
    JOIN users u ON u.id = v.user_id
    WHERE pv.playlist_id = ?
    ORDER BY pv.position ASC, pv.added_at ASC
  `).all(playlist.id).map((r) => publicVideo(r, {
    channel: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
  }));
  const owner = db.prepare('SELECT username, display_name, avatar FROM users WHERE id = ?').get(playlist.user_id);
  return ok(res, {
    id: playlist.id,
    title: playlist.title,
    description: playlist.description,
    visibility: playlist.visibility,
    owner: {
      id: playlist.user_id,
      username: owner.username,
      displayName: owner.display_name,
      avatar: owner.avatar,
    },
    videos,
  });
});

router.post('/:id/videos', requireAuth, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist || playlist.user_id !== req.user.id) return fail(res, 404, 'Playlist not found');
  const videoId = req.body.videoId;
  const video = db.prepare('SELECT id FROM videos WHERE id = ?').get(videoId);
  if (!video) return fail(res, 404, 'Video not found');
  const pos = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM playlist_videos WHERE playlist_id = ?')
    .get(playlist.id).p;
  db.prepare(`
    INSERT INTO playlist_videos (playlist_id, video_id, position) VALUES (?, ?, ?)
    ON CONFLICT(playlist_id, video_id) DO NOTHING
  `).run(playlist.id, videoId, pos);
  return ok(res, { added: true });
});

router.delete('/:id/videos/:videoId', requireAuth, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist || playlist.user_id !== req.user.id) return fail(res, 404, 'Playlist not found');
  db.prepare('DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?')
    .run(playlist.id, req.params.videoId);
  return ok(res, { removed: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist || playlist.user_id !== req.user.id) return fail(res, 404, 'Playlist not found');
  db.prepare('DELETE FROM playlists WHERE id = ?').run(playlist.id);
  return ok(res, { deleted: true });
});

export default router;
