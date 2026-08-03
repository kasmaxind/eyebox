import { Router } from 'express';
import { db, publicUser } from '../db.js';
import { id } from '../utils/helpers.js';
import { ok, fail } from '../utils/response.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.get('/:videoId/comments', optionalAuth, (req, res) => {
  const video = db.prepare('SELECT id, visibility, is_encrypted, user_id FROM videos WHERE id = ?').get(req.params.videoId);
  if (!video) return fail(res, 404, 'Video not found');
  if (video.visibility === 'private' && (!req.user || (req.user.id !== video.user_id))) {
    const share = req.user
      ? db.prepare('SELECT 1 FROM video_shares WHERE video_id = ? AND recipient_id = ?').get(video.id, req.user.id)
      : null;
    if (!share && req.user?.id !== video.user_id) return fail(res, 404, 'Video not found');
  }

  const rows = db.prepare(`
    SELECT c.*, u.username, u.display_name, u.avatar
    FROM comments c JOIN users u ON u.id = c.user_id
    WHERE c.video_id = ?
    ORDER BY c.created_at DESC
  `).all(video.id);

  const comments = rows.map((r) => ({
    id: r.id,
    videoId: r.video_id,
    parentId: r.parent_id,
    body: r.body,
    likesCount: r.likes_count,
    createdAt: r.created_at,
    author: {
      id: r.user_id,
      username: r.username,
      displayName: r.display_name,
      avatar: r.avatar,
    },
  }));

  return ok(res, comments);
});

router.post('/:videoId/comments', requireAuth, (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.videoId);
  if (!video) return fail(res, 404, 'Video not found');
  const body = String(req.body.body || '').trim().slice(0, 2000);
  if (!body) return fail(res, 400, 'Comment body required');
  const parentId = req.body.parentId || null;
  if (parentId) {
    const parent = db.prepare('SELECT id FROM comments WHERE id = ? AND video_id = ?').get(parentId, video.id);
    if (!parent) return fail(res, 400, 'Parent comment not found');
  }

  const commentId = id('cmt');
  db.prepare(`
    INSERT INTO comments (id, video_id, user_id, parent_id, body) VALUES (?, ?, ?, ?, ?)
  `).run(commentId, video.id, req.user.id, parentId, body);
  db.prepare('UPDATE videos SET comments_count = comments_count + 1 WHERE id = ?').run(video.id);

  if (video.user_id !== req.user.id) {
    db.prepare(`INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, 'comment', ?, ?, ?)`)
      .run(id('ntf'), video.user_id, 'New comment', `${req.user.displayName}: ${body.slice(0, 80)}`, `/watch/${video.id}`);
  }

  return ok(res, {
    id: commentId,
    videoId: video.id,
    parentId,
    body,
    likesCount: 0,
    createdAt: new Date().toISOString(),
    author: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      avatar: req.user.avatar,
    },
  });
});

router.delete('/comments/:id', requireAuth, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return fail(res, 404, 'Comment not found');
  const video = db.prepare('SELECT user_id FROM videos WHERE id = ?').get(comment.video_id);
  if (comment.user_id !== req.user.id && video?.user_id !== req.user.id && req.user.role !== 'admin') {
    return fail(res, 403, 'Not allowed');
  }
  db.prepare('DELETE FROM comments WHERE id = ?').run(comment.id);
  db.prepare('UPDATE videos SET comments_count = MAX(comments_count - 1, 0) WHERE id = ?').run(comment.video_id);
  return ok(res, { deleted: true });
});

export default router;
