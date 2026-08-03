import { Router } from 'express';
import { db } from '../db.js';
import { ok, fail } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const unreadOnly = req.query.unread === '1';
  const rows = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ? ${unreadOnly ? 'AND read = 0' : ''}
    ORDER BY created_at DESC LIMIT 50
  `).all(req.user.id);
  return ok(res, rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: Boolean(n.read),
    createdAt: n.created_at,
  })));
});

router.post('/read', requireAuth, (req, res) => {
  const { ids } = req.body || {};
  if (Array.isArray(ids) && ids.length) {
    const stmt = db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND id = ?');
    const tx = db.transaction((list) => list.forEach((id) => stmt.run(req.user.id, id)));
    tx(ids);
  } else {
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  }
  return ok(res, { read: true });
});

router.get('/unread-count', requireAuth, (req, res) => {
  const c = db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0').get(req.user.id).c;
  return ok(res, { count: c });
});

export default router;
