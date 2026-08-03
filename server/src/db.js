import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { env } from './config.js';

const dirs = ['videos', 'thumbs', 'avatars', 'encrypted', 'hls'];
for (const d of dirs) {
  fs.mkdirSync(path.join(env.dataDir, d), { recursive: true });
}

const dbPath = path.join(env.dataDir, 'eyebox.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar TEXT,
  banner TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  e2e_public_key TEXT,
  e2e_encrypted_private_key TEXT,
  e2e_salt TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  device_name TEXT,
  user_agent TEXT,
  ip TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  filename TEXT,
  encrypted_filename TEXT,
  thumbnail TEXT,
  duration REAL DEFAULT 0,
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  size_bytes INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'video/mp4',
  visibility TEXT NOT NULL DEFAULT 'public',
  is_encrypted INTEGER NOT NULL DEFAULT 0,
  encrypted_content_key TEXT,
  encryption_iv TEXT,
  category TEXT DEFAULT 'General',
  tags TEXT DEFAULT '[]',
  views INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS likes (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  subscriber_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (subscriber_id, channel_id)
);

CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS playlist_videos (
  playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (playlist_id, video_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  progress REAL DEFAULT 0,
  watched_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS watch_later (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  link TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS video_shares (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wrapped_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(video_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_videos_user ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_visibility ON videos(visibility);
CREATE INDEX IF NOT EXISTS idx_videos_created ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
`);

export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio || '',
    avatar: row.avatar,
    banner: row.banner,
    role: row.role,
    e2ePublicKey: row.e2e_public_key || null,
    hasE2E: Boolean(row.e2e_public_key),
    createdAt: row.created_at,
  };
}

export function publicVideo(row, extras = {}) {
  if (!row) return null;
  let tags = [];
  try { tags = JSON.parse(row.tags || '[]'); } catch { tags = []; }
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    thumbnail: row.thumbnail,
    duration: row.duration || 0,
    width: row.width || 0,
    height: row.height || 0,
    sizeBytes: row.size_bytes || 0,
    mimeType: row.mime_type || 'video/mp4',
    visibility: row.visibility,
    isEncrypted: Boolean(row.is_encrypted),
    category: row.category || 'General',
    tags,
    views: row.views || 0,
    likesCount: row.likes_count || 0,
    commentsCount: row.comments_count || 0,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    streamUrl: row.is_encrypted
      ? `/api/videos/${row.id}/encrypted`
      : `/api/videos/${row.id}/stream`,
    ...extras,
  };
}
