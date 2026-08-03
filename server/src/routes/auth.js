import { Router } from 'express';
import { z } from 'zod';
import { db, publicUser } from '../db.js';
import { id, slugify } from '../utils/helpers.js';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshExpiryDate,
} from '../utils/auth.js';
import { ok, fail } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(64),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceName: z.string().max(100).optional(),
});

function tokensFor(user) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, username: user.username });
  const refreshToken = signRefreshToken({ sub: user.id, sid: id('ses') });
  return { accessToken, refreshToken };
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Invalid registration data', parsed.error.flatten());

  const { email, password, username, displayName } = parsed.data;
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
    .get(email.toLowerCase(), username.toLowerCase());
  if (existing) return fail(res, 409, 'Email or username already taken');

  const userId = id('usr');
  const passwordHash = await hashPassword(password);
  db.prepare(`
    INSERT INTO users (id, email, username, display_name, password_hash, role)
    VALUES (?, ?, ?, ?, ?, 'user')
  `).run(userId, email.toLowerCase(), username.toLowerCase(), displayName, passwordHash);

  // Default Watch Later playlist
  db.prepare(`INSERT INTO playlists (id, user_id, title, description, visibility)
    VALUES (?, ?, 'Watch Later', 'Videos saved for later', 'private')`)
    .run(id('pl'), userId);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const { accessToken, refreshToken } = tokensFor(user);
  const payload = verifyRefreshToken(refreshToken);
  db.prepare(`
    INSERT INTO sessions (id, user_id, refresh_token_hash, device_name, user_agent, ip, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.sid,
    userId,
    hashToken(refreshToken),
    req.body.deviceName || 'Web',
    req.headers['user-agent'] || '',
    req.ip || '',
    refreshExpiryDate(),
  );

  return ok(res, {
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Invalid login data');

  const { email, password, deviceName } = parsed.data;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return fail(res, 401, 'Invalid email or password');

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return fail(res, 401, 'Invalid email or password');

  const { accessToken, refreshToken } = tokensFor(user);
  const payload = verifyRefreshToken(refreshToken);
  db.prepare(`
    INSERT INTO sessions (id, user_id, refresh_token_hash, device_name, user_agent, ip, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.sid,
    user.id,
    hashToken(refreshToken),
    deviceName || 'Web',
    req.headers['user-agent'] || '',
    req.ip || '',
    refreshExpiryDate(),
  );

  return ok(res, {
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return fail(res, 400, 'Refresh token required');
  try {
    const payload = verifyRefreshToken(refreshToken);
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(payload.sid);
    if (!session || session.refresh_token_hash !== hashToken(refreshToken)) {
      return fail(res, 401, 'Invalid session');
    }
    if (new Date(session.expires_at) < new Date()) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
      return fail(res, 401, 'Session expired');
    }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) return fail(res, 401, 'User not found');

    const accessToken = signAccessToken({ sub: user.id, role: user.role, username: user.username });
    const newRefresh = signRefreshToken({ sub: user.id, sid: session.id });
    db.prepare('UPDATE sessions SET refresh_token_hash = ?, expires_at = ? WHERE id = ?')
      .run(hashToken(newRefresh), refreshExpiryDate(), session.id);

    return ok(res, { accessToken, refreshToken: newRefresh, user: publicUser(user) });
  } catch {
    return fail(res, 401, 'Invalid refresh token');
  }
});

router.post('/logout', requireAuth, (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      db.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?').run(payload.sid, req.user.id);
    } catch { /* ignore */ }
  } else {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(req.user.id);
  }
  return ok(res, { loggedOut: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return ok(res, {
    user: publicUser(user),
    e2e: {
      publicKey: user.e2e_public_key || null,
      encryptedPrivateKey: user.e2e_encrypted_private_key || null,
      salt: user.e2e_salt || null,
    },
  });
});

router.put('/e2e-keys', requireAuth, (req, res) => {
  const { publicKey, encryptedPrivateKey, salt } = req.body || {};
  if (!publicKey || !encryptedPrivateKey || !salt) {
    return fail(res, 400, 'publicKey, encryptedPrivateKey, and salt are required');
  }
  db.prepare(`
    UPDATE users SET e2e_public_key = ?, e2e_encrypted_private_key = ?, e2e_salt = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(publicKey, encryptedPrivateKey, salt, req.user.id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return ok(res, { user: publicUser(user) });
});

router.get('/sessions', requireAuth, (req, res) => {
  const sessions = db.prepare(`
    SELECT id, device_name, user_agent, ip, created_at, expires_at
    FROM sessions WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);
  return ok(res, sessions.map((s) => ({
    id: s.id,
    deviceName: s.device_name,
    userAgent: s.user_agent,
    ip: s.ip,
    createdAt: s.created_at,
    expiresAt: s.expires_at,
  })));
});

router.delete('/sessions/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return ok(res, { deleted: true });
});

export default router;
