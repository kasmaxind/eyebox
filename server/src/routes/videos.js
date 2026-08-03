import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { db, publicUser, publicVideo } from '../db.js';
import { env } from '../config.js';
import { id } from '../utils/helpers.js';
import { ok, fail } from '../utils/response.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { videoUpload, encryptedUpload, thumbUpload } from '../middleware/upload.js';
import { probeVideo, generateThumbnail } from '../services/media.js';

const router = Router();

function canViewVideo(video, user) {
  if (!video) return false;
  if (video.visibility === 'public') return true;
  if (!user) return false;
  if (video.user_id === user.id) return true;
  if (video.visibility === 'unlisted') return true;
  if (video.visibility === 'private' || video.is_encrypted) {
    if (video.user_id === user.id) return true;
    const share = db.prepare('SELECT id FROM video_shares WHERE video_id = ? AND recipient_id = ?')
      .get(video.id, user.id);
    return Boolean(share);
  }
  return false;
}

function attachChannel(video) {
  const channel = db.prepare('SELECT * FROM users WHERE id = ?').get(video.user_id);
  return publicVideo(video, {
    channel: channel ? {
      id: channel.id,
      username: channel.username,
      displayName: channel.display_name,
      avatar: channel.avatar,
      subscribers: db.prepare('SELECT COUNT(*) AS c FROM subscriptions WHERE channel_id = ?').get(channel.id).c,
    } : null,
  });
}

router.get('/', optionalAuth, (req, res) => {
  const {
    q = '',
    category = '',
    sort = 'latest',
    page = '1',
    limit = '24',
    channel = '',
  } = req.query;

  const pageN = Math.max(1, Number(page) || 1);
  const limitN = Math.min(50, Math.max(1, Number(limit) || 24));
  const offset = (pageN - 1) * limitN;

  const where = ["(v.visibility = 'public' OR v.visibility = 'unlisted')", "v.is_encrypted = 0", "v.status = 'ready'"];
  const params = [];

  if (q) {
    where.push('(v.title LIKE ? OR v.description LIKE ? OR v.tags LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (category) {
    where.push('v.category = ?');
    params.push(category);
  }
  if (channel) {
    where.push('u.username = ?');
    params.push(channel);
  }

  let order = 'v.created_at DESC';
  if (sort === 'popular') order = 'v.views DESC, v.likes_count DESC';
  if (sort === 'trending') order = '(v.views + v.likes_count * 5) DESC, v.created_at DESC';

  const sql = `
    SELECT v.*, u.username, u.display_name, u.avatar
    FROM videos v JOIN users u ON u.id = v.user_id
    WHERE ${where.join(' AND ')}
    ORDER BY ${order}
    LIMIT ? OFFSET ?
  `;
  const rows = db.prepare(sql).all(...params, limitN, offset);
  const total = db.prepare(`
    SELECT COUNT(*) AS c FROM videos v JOIN users u ON u.id = v.user_id
    WHERE ${where.join(' AND ')}
  `).get(...params).c;

  return ok(res, rows.map((r) => publicVideo(r, {
    channel: {
      id: r.user_id,
      username: r.username,
      displayName: r.display_name,
      avatar: r.avatar,
    },
  })), { page: pageN, limit: limitN, total });
});

router.get('/feed', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT v.*, u.username, u.display_name, u.avatar
    FROM videos v
    JOIN users u ON u.id = v.user_id
    JOIN subscriptions s ON s.channel_id = v.user_id
    WHERE s.subscriber_id = ? AND v.visibility = 'public' AND v.is_encrypted = 0 AND v.status = 'ready'
    ORDER BY v.created_at DESC
    LIMIT 48
  `).all(req.user.id);
  return ok(res, rows.map((r) => publicVideo(r, {
    channel: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
  })));
});

router.get('/mine', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT v.*, u.username, u.display_name, u.avatar
    FROM videos v JOIN users u ON u.id = v.user_id
    WHERE v.user_id = ?
    ORDER BY v.created_at DESC
  `).all(req.user.id);
  return ok(res, rows.map((r) => publicVideo(r, {
    channel: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
    encryptedContentKey: r.encrypted_content_key || null,
    encryptionIv: r.encryption_iv || null,
  })));
});

router.get('/categories', (_req, res) => {
  const cats = db.prepare(`
    SELECT category AS name, COUNT(*) AS count FROM videos
    WHERE visibility = 'public' AND is_encrypted = 0 AND status = 'ready'
    GROUP BY category ORDER BY count DESC
  `).all();
  return ok(res, cats);
});

router.get('/:id', optionalAuth, (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video || !canViewVideo(video, req.user)) return fail(res, 404, 'Video not found');

  db.prepare('UPDATE videos SET views = views + 1 WHERE id = ?').run(video.id);
  video.views += 1;

  let liked = false;
  let subscribed = false;
  let wrappedKey = null;
  let encryptedContentKey = null;
  let encryptionIv = null;

  if (req.user) {
    liked = Boolean(db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND video_id = ?').get(req.user.id, video.id));
    subscribed = Boolean(db.prepare('SELECT 1 FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?').get(req.user.id, video.user_id));
    db.prepare(`
      INSERT INTO watch_history (user_id, video_id, progress, watched_at)
      VALUES (?, ?, 0, datetime('now'))
      ON CONFLICT(user_id, video_id) DO UPDATE SET watched_at = datetime('now')
    `).run(req.user.id, video.id);

    if (video.is_encrypted) {
      if (video.user_id === req.user.id) {
        encryptedContentKey = video.encrypted_content_key;
        encryptionIv = video.encryption_iv;
      } else {
        const share = db.prepare('SELECT wrapped_key FROM video_shares WHERE video_id = ? AND recipient_id = ?')
          .get(video.id, req.user.id);
        if (share) {
          wrappedKey = share.wrapped_key;
          encryptionIv = video.encryption_iv;
        }
      }
    }
  }

  const related = db.prepare(`
    SELECT v.*, u.username, u.display_name, u.avatar FROM videos v
    JOIN users u ON u.id = v.user_id
    WHERE v.id != ? AND v.visibility = 'public' AND v.is_encrypted = 0 AND v.status = 'ready'
      AND (v.category = ? OR v.user_id = ?)
    ORDER BY v.views DESC LIMIT 12
  `).all(video.id, video.category, video.user_id);

  return ok(res, {
    ...attachChannel(video),
    liked,
    subscribed,
    encryptedContentKey,
    encryptionIv,
    wrappedKey,
    related: related.map((r) => publicVideo(r, {
      channel: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
    })),
  });
});

router.post('/upload', requireAuth, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) return fail(res, 400, 'Video file required');
    const title = (req.body.title || req.file.originalname || 'Untitled').slice(0, 120);
    const description = (req.body.description || '').slice(0, 5000);
    const visibility = ['public', 'unlisted', 'private'].includes(req.body.visibility)
      ? req.body.visibility : 'public';
    const category = (req.body.category || 'General').slice(0, 40);
    let tags = [];
    try { tags = JSON.parse(req.body.tags || '[]'); } catch { tags = String(req.body.tags || '').split(',').map((t) => t.trim()).filter(Boolean); }

    const filePath = req.file.path;
    const meta = await probeVideo(filePath);
    const thumb = await generateThumbnail(filePath);
    const videoId = id('vid');

    db.prepare(`
      INSERT INTO videos (
        id, user_id, title, description, filename, thumbnail, duration, width, height,
        size_bytes, mime_type, visibility, is_encrypted, category, tags, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'ready')
    `).run(
      videoId, req.user.id, title, description, req.file.filename, thumb,
      meta.duration, meta.width, meta.height, meta.size || req.file.size,
      req.file.mimetype || meta.mimeType, visibility, category, JSON.stringify(tags.slice(0, 20)),
    );

    // Notify subscribers for public uploads
    if (visibility === 'public') {
      const subs = db.prepare('SELECT subscriber_id FROM subscriptions WHERE channel_id = ?').all(req.user.id);
      const insert = db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, body, link)
        VALUES (?, ?, 'upload', ?, ?, ?)
      `);
      const notify = db.transaction((rows) => {
        for (const s of rows) {
          insert.run(id('ntf'), s.subscriber_id, `${req.user.displayName} uploaded a video`, title, `/watch/${videoId}`);
        }
      });
      notify(subs);
    }

    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);
    return ok(res, attachChannel(video));
  } catch (err) {
    console.error(err);
    return fail(res, 500, err.message || 'Upload failed');
  }
});

router.post('/upload-encrypted', requireAuth, encryptedUpload.fields([
  { name: 'ciphertext', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]), (req, res) => {
  try {
    const file = req.files?.ciphertext?.[0];
    if (!file) return fail(res, 400, 'Encrypted ciphertext required');

    const {
      title = 'Encrypted video',
      description = '',
      category = 'Private',
      tags = '[]',
      encryptedContentKey,
      encryptionIv,
      duration = '0',
      mimeType = 'video/mp4',
    } = req.body;

    if (!encryptedContentKey || !encryptionIv) {
      return fail(res, 400, 'encryptedContentKey and encryptionIv required');
    }

    const user = db.prepare('SELECT e2e_public_key FROM users WHERE id = ?').get(req.user.id);
    if (!user?.e2e_public_key) {
      return fail(res, 400, 'Set up E2E keys before uploading encrypted videos');
    }

    let parsedTags = [];
    try { parsedTags = JSON.parse(tags); } catch { parsedTags = []; }

    const videoId = id('vid');
    const thumbFile = req.files?.thumbnail?.[0]?.filename || null;

    db.prepare(`
      INSERT INTO videos (
        id, user_id, title, description, encrypted_filename, thumbnail, duration,
        size_bytes, mime_type, visibility, is_encrypted, encrypted_content_key,
        encryption_iv, category, tags, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'private', 1, ?, ?, ?, ?, 'ready')
    `).run(
      videoId, req.user.id, String(title).slice(0, 120), String(description).slice(0, 5000),
      file.filename, thumbFile, Number(duration) || 0, file.size, mimeType,
      encryptedContentKey, encryptionIv, String(category).slice(0, 40),
      JSON.stringify(parsedTags.slice(0, 20)),
    );

    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);
    return ok(res, publicVideo(video, {
      encryptedContentKey,
      encryptionIv,
      channel: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.displayName,
        avatar: req.user.avatar,
      },
    }));
  } catch (err) {
    console.error(err);
    return fail(res, 500, err.message || 'Encrypted upload failed');
  }
});

router.get('/:id/stream', optionalAuth, (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video || video.is_encrypted || !canViewVideo(video, req.user)) {
    return fail(res, 404, 'Video not found');
  }
  if (!video.filename) return fail(res, 404, 'Media missing');

  const filePath = path.join(env.dataDir, 'videos', video.filename);
  if (!fs.existsSync(filePath)) return fail(res, 404, 'File missing');

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', video.mime_type || 'video/mp4');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (!range) {
    res.setHeader('Content-Length', fileSize);
    return fs.createReadStream(filePath).pipe(res);
  }

  const match = range.match(/bytes=(\d+)-(\d*)/);
  if (!match) return fail(res, 416, 'Invalid range');
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : Math.min(start + 1024 * 1024 - 1, fileSize - 1);
  if (start >= fileSize || end >= fileSize) {
    res.setHeader('Content-Range', `bytes */${fileSize}`);
    return res.status(416).end();
  }

  res.status(206);
  res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
  res.setHeader('Content-Length', end - start + 1);
  fs.createReadStream(filePath, { start, end }).pipe(res);
});

router.get('/:id/encrypted', requireAuth, (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video || !video.is_encrypted || !canViewVideo(video, req.user)) {
    return fail(res, 404, 'Encrypted video not found');
  }
  const filePath = path.join(env.dataDir, 'encrypted', video.encrypted_filename);
  if (!fs.existsSync(filePath)) return fail(res, 404, 'Ciphertext missing');

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('X-Encryption', 'aes-gcm-e2e');
  fs.createReadStream(filePath).pipe(res);
});

router.post('/:id/share', requireAuth, (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video || video.user_id !== req.user.id) return fail(res, 404, 'Video not found');
  if (!video.is_encrypted) return fail(res, 400, 'Only encrypted videos need key shares');

  const { recipientUsername, wrappedKey } = req.body || {};
  if (!recipientUsername || !wrappedKey) return fail(res, 400, 'recipientUsername and wrappedKey required');

  const recipient = db.prepare('SELECT * FROM users WHERE username = ?').get(String(recipientUsername).toLowerCase());
  if (!recipient) return fail(res, 404, 'Recipient not found');
  if (!recipient.e2e_public_key) return fail(res, 400, 'Recipient has not enabled E2E encryption');

  const shareId = id('shr');
  db.prepare(`
    INSERT INTO video_shares (id, video_id, owner_id, recipient_id, wrapped_key)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(video_id, recipient_id) DO UPDATE SET wrapped_key = excluded.wrapped_key
  `).run(shareId, video.id, req.user.id, recipient.id, wrappedKey);

  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, body, link)
    VALUES (?, ?, 'share', ?, ?, ?)
  `).run(
    id('ntf'), recipient.id, 'Encrypted video shared with you',
    `${req.user.displayName} shared “${video.title}”`,
    `/watch/${video.id}`,
  );

  return ok(res, { shared: true, recipient: publicUser(recipient) });
});

router.patch('/:id', requireAuth, (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video || video.user_id !== req.user.id) return fail(res, 404, 'Video not found');

  const title = req.body.title !== undefined ? String(req.body.title).slice(0, 120) : video.title;
  const description = req.body.description !== undefined ? String(req.body.description).slice(0, 5000) : video.description;
  const visibility = ['public', 'unlisted', 'private'].includes(req.body.visibility)
    ? req.body.visibility
    : video.visibility;
  const category = req.body.category !== undefined ? String(req.body.category).slice(0, 40) : video.category;

  if (video.is_encrypted && visibility !== 'private') {
    return fail(res, 400, 'Encrypted videos must remain private');
  }

  db.prepare(`
    UPDATE videos SET title = ?, description = ?, visibility = ?, category = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title, description, visibility, category, video.id);

  return ok(res, attachChannel(db.prepare('SELECT * FROM videos WHERE id = ?').get(video.id)));
});

router.delete('/:id', requireAuth, (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video || (video.user_id !== req.user.id && req.user.role !== 'admin')) {
    return fail(res, 404, 'Video not found');
  }
  if (video.filename) {
    const p = path.join(env.dataDir, 'videos', video.filename);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  if (video.encrypted_filename) {
    const p = path.join(env.dataDir, 'encrypted', video.encrypted_filename);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  if (video.thumbnail) {
    const p = path.join(env.dataDir, 'thumbs', video.thumbnail);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  db.prepare('DELETE FROM videos WHERE id = ?').run(video.id);
  return ok(res, { deleted: true });
});

router.post('/:id/like', requireAuth, (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video || !canViewVideo(video, req.user)) return fail(res, 404, 'Video not found');

  const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND video_id = ?').get(req.user.id, video.id);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND video_id = ?').run(req.user.id, video.id);
    db.prepare('UPDATE videos SET likes_count = MAX(likes_count - 1, 0) WHERE id = ?').run(video.id);
    return ok(res, { liked: false, likesCount: video.likes_count - 1 });
  }
  db.prepare('INSERT INTO likes (user_id, video_id) VALUES (?, ?)').run(req.user.id, video.id);
  db.prepare('UPDATE videos SET likes_count = likes_count + 1 WHERE id = ?').run(video.id);
  if (video.user_id !== req.user.id) {
    db.prepare(`INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, 'like', ?, ?, ?)`)
      .run(id('ntf'), video.user_id, 'New like', `${req.user.displayName} liked your video`, `/watch/${video.id}`);
  }
  return ok(res, { liked: true, likesCount: video.likes_count + 1 });
});

router.post('/:id/thumbnail', requireAuth, thumbUpload.single('thumbnail'), (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video || video.user_id !== req.user.id) return fail(res, 404, 'Video not found');
  if (!req.file) return fail(res, 400, 'Thumbnail required');
  db.prepare('UPDATE videos SET thumbnail = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(req.file.filename, video.id);
  return ok(res, { thumbnail: req.file.filename });
});

export default router;
