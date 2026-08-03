import { verifyAccessToken } from '../utils/auth.js';
import { db, publicUser } from '../db.js';
import { fail } from '../utils/response.js';

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = verifyAccessToken(token);
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    req.user = row ? publicUser(row) : null;
    req.userRow = row || null;
  } catch {
    req.user = null;
    req.userRow = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return fail(res, 401, 'Authentication required');
    next();
  });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 401, 'Authentication required');
    if (!roles.includes(req.user.role)) return fail(res, 403, 'Insufficient permissions');
    next();
  };
}
