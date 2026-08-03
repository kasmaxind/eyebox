import { Router } from 'express';
import { db, publicUser, publicVideo } from '../db.js';
import { id } from '../utils/helpers.js';
import { ok, fail } from '../utils/response.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';

const router = Router();

router.get('/search', optionalAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return ok(res, { users: [], videos: [] });
  const like = `%${q}%`;
  const users = db.prepare(`
    SELECT * FROM users WHERE username LIKE ? OR display_name LIKE ? LIMIT 12
  `).all(like, like).map(publicUser);

  const videos = db.prepare(`
    SELECT v.*, u.username, u.display_name, u.avatar FROM videos v
    JOIN users u ON u.id = v.user_id
    WHERE v.visibility = 'public' AND v.is_encrypted = 0 AND v.status = 'ready'
      AND (v.title LIKE ? OR v.description LIKE ? OR u.display_name LIKE ?)
    ORDER BY v.views DESC LIMIT 24
  `).all(like, like, like).map((r) => publicVideo(r, {
    channel: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
  }));

  return ok(res, { users, videos });
});

router.patch('/me', requireAuth, (req, res) => {
  const { displayName, bio } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  db.prepare(`
    UPDATE users SET display_name = ?, bio = ?, updated_at = datetime('now') WHERE id = ?
  `).run(
    displayName !== undefined ? String(displayName).slice(0, 64) : user.display_name,
    bio !== undefined ? String(bio).slice(0, 500) : user.bio,
    req.user.id,
  );
  return ok(res, { user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)) });
});

router.post('/me/avatar', requireAuth, imageUpload.single('avatar'), (req, res) => {
  if (!req.file) return fail(res, 400, 'Avatar required');
  db.prepare('UPDATE users SET avatar = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(req.file.filename, req.user.id);
  return ok(res, { avatar: req.file.filename });
});

router.get('/me/subscriptions', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT u.* FROM subscriptions s
    JOIN users u ON u.id = s.channel_id
    WHERE s.subscriber_id = ?
    ORDER BY s.created_at DESC
  `).all(req.user.id);
  return ok(res, rows.map(publicUser));
});

router.get('/me/history', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT v.*, u.username, u.display_name, u.avatar, h.watched_at, h.progress
    FROM watch_history h
    JOIN videos v ON v.id = h.video_id
    JOIN users u ON u.id = v.user_id
    WHERE h.user_id = ? AND (v.visibility = 'public' OR v.user_id = ?)
    ORDER BY h.watched_at DESC LIMIT 100
  `).all(req.user.id, req.user.id);
  return ok(res, rows.map((r) => publicVideo(r, {
    watchedAt: r.watched_at,
    progress: r.progress,
    channel: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
  })));
});

router.delete('/me/history', requireAuth, (req, res) => {
  db.prepare('DELETE FROM watch_history WHERE user_id = ?').run(req.user.id);
  return ok(res, { cleared: true });
});

router.get('/me/watch-later', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT v.*, u.username, u.display_name, u.avatar, w.added_at
    FROM watch_later w
    JOIN videos v ON v.id = w.video_id
    JOIN users u ON u.id = v.user_id
    WHERE w.user_id = ?
    ORDER BY w.added_at DESC
  `).all(req.user.id);
  return ok(res, rows.map((r) => publicVideo(r, {
    addedAt: r.added_at,
    channel: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
  })));
});

router.post('/me/watch-later/:videoId', requireAuth, (req, res) => {
  const video = db.prepare('SELECT id FROM videos WHERE id = ?').get(req.params.videoId);
  if (!video) return fail(res, 404, 'Video not found');
  const existing = db.prepare('SELECT 1 FROM watch_later WHERE user_id = ? AND video_id = ?')
    .get(req.user.id, video.id);
  if (existing) {
    db.prepare('DELETE FROM watch_later WHERE user_id = ? AND video_id = ?').run(req.user.id, video.id);
    return ok(res, { saved: false });
  }
  db.prepare('INSERT INTO watch_later (user_id, video_id) VALUES (?, ?)').run(req.user.id, video.id);
  return ok(res, { saved: true });
});

router.get('/:username/public-key', requireAuth, (req, res) => {
  const user = db.prepare('SELECT username, e2e_public_key FROM users WHERE username = ?')
    .get(req.params.username.toLowerCase());
  if (!user) return fail(res, 404, 'User not found');
  if (!user.e2e_public_key) return fail(res, 404, 'User has no E2E public key');
  return ok(res, { username: user.username, publicKey: user.e2e_public_key });
});

router.post('/:username/subscribe', requireAuth, (req, res) => {
  const channel = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username.toLowerCase());
  if (!channel) return fail(res, 404, 'Channel not found');
  if (channel.id === req.user.id) return fail(res, 400, 'Cannot subscribe to yourself');

  const existing = db.prepare('SELECT 1 FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?')
    .get(req.user.id, channel.id);
  if (existing) {
    db.prepare('DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?')
      .run(req.user.id, channel.id);
    return ok(res, { subscribed: false });
  }
  db.prepare('INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)')
    .run(req.user.id, channel.id);
  db.prepare(`INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, 'subscribe', ?, ?, ?)`)
    .run(id('ntf'), channel.id, 'New subscriber', `${req.user.displayName} subscribed to your channel`, `/c/${channel.username}`);
  return ok(res, { subscribed: true });
});

router.get('/:username', optionalAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username.toLowerCase());
  if (!user) return fail(res, 404, 'Channel not found');

  const subscribers = db.prepare('SELECT COUNT(*) AS c FROM subscriptions WHERE channel_id = ?').get(user.id).c;
  const subscribed = req.user
    ? Boolean(db.prepare('SELECT 1 FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?').get(req.user.id, user.id))
    : false;

  const isOwner = req.user?.id === user.id;
  const videos = db.prepare(`
    SELECT v.*, u.username, u.display_name, u.avatar FROM videos v
    JOIN users u ON u.id = v.user_id
    WHERE v.user_id = ? AND v.status = 'ready'
      AND (${isOwner ? '1=1' : "v.visibility = 'public' AND v.is_encrypted = 0"})
    ORDER BY v.created_at DESC
  `).all(user.id).map((r) => publicVideo(r, {
    channel: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
  }));

  return ok(res, {
    channel: {
      ...publicUser(user),
      subscribers,
      videoCount: videos.length,
      subscribed,
    },
    videos,
  });
});

export default router;
