import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config.js';

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessTtl });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

export function parseTtlToMs(ttl) {
  const m = String(ttl).match(/^(\d+)([smhd])$/);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const u = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * u[m[2]];
}

export function refreshExpiryDate() {
  return new Date(Date.now() + parseTtlToMs(env.refreshTtl)).toISOString();
}
