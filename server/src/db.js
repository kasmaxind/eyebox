import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../data");
const uploadsDir = path.resolve(__dirname, "../../uploads");
const thumbsDir = path.join(uploadsDir, "thumbs");

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(thumbsDir, { recursive: true });

const db = new Database(path.join(dataDir, "eyebox.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    avatar_color TEXT NOT NULL,
    subscribers INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL REFERENCES channels(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    filename TEXT NOT NULL,
    thumbnail TEXT,
    duration REAL NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_videos_created ON videos(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_videos_views ON videos(views DESC);
  CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id);

  CREATE TABLE IF NOT EXISTS playback_packages (
    video_id TEXT PRIMARY KEY REFERENCES videos(id) ON DELETE CASCADE,
    hls_master TEXT,
    max_fps INTEGER NOT NULL DEFAULT 30,
    hdr INTEGER NOT NULL DEFAULT 0,
    has_hls INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS video_renditions (
    id TEXT PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    quality TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    fps INTEGER NOT NULL DEFAULT 30,
    codec TEXT NOT NULL DEFAULT 'h264',
    hdr INTEGER NOT NULL DEFAULT 0,
    bitrate INTEGER NOT NULL DEFAULT 0,
    filename TEXT,
    hls_playlist TEXT
  );

  CREATE TABLE IF NOT EXISTS video_subtitles (
    id TEXT PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    label TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'manual',
    vtt_file TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS video_audio_tracks (
    id TEXT PRIMARY KEY,
    video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    label TEXT NOT NULL,
    filename TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_renditions_video ON video_renditions(video_id);
  CREATE INDEX IF NOT EXISTS idx_subtitles_video ON video_subtitles(video_id);
`);

export { db, uploadsDir, thumbsDir, dataDir };
