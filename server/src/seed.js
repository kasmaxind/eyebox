import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { env } from './config.js';
import { db } from './db.js';
import { hashPassword } from './utils/auth.js';
import { id } from './utils/helpers.js';
import { probeVideo, generateThumbnail } from './services/media.js';

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: 'ignore' });
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
    proc.on('error', reject);
  });
}

async function makeClip(filename, color, label, duration = 4) {
  const out = path.join(env.dataDir, 'videos', filename);
  await runFfmpeg([
    '-y',
    '-f', 'lavfi', '-i', `color=c=${color}:s=1280x720:d=${duration}`,
    '-f', 'lavfi', '-i', `sine=frequency=440:duration=${duration}`,
    '-vf', `drawtext=text='${label}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest',
    out,
  ]);
  return out;
}

async function main() {
  console.log('Seeding EyeBox…');

  // Clean existing demo data lightly — keep schema
  db.exec(`
    DELETE FROM video_shares;
    DELETE FROM notifications;
    DELETE FROM watch_later;
    DELETE FROM watch_history;
    DELETE FROM playlist_videos;
    DELETE FROM playlists;
    DELETE FROM likes;
    DELETE FROM comments;
    DELETE FROM subscriptions;
    DELETE FROM sessions;
    DELETE FROM videos;
    DELETE FROM users;
  `);

  const adminPass = await hashPassword('Admin@EyeBox2026!');
  const creatorPass = await hashPassword('Creator@EyeBox2026!');
  const viewerPass = await hashPassword('Viewer@EyeBox2026!');

  const adminId = id('usr');
  const creatorId = id('usr');
  const viewerId = id('usr');

  db.prepare(`INSERT INTO users (id, email, username, display_name, password_hash, bio, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    adminId, 'admin@eyebox.local', 'admin', 'EyeBox Admin', adminPass, 'Platform administrator', 'admin',
  );
  db.prepare(`INSERT INTO users (id, email, username, display_name, password_hash, bio, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    creatorId, 'creator@eyebox.local', 'nova', 'Nova Labs', creatorPass, 'Original films & tech demos on EyeBox', 'creator',
  );
  db.prepare(`INSERT INTO users (id, email, username, display_name, password_hash, bio, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    viewerId, 'viewer@eyebox.local', 'viewer', 'Demo Viewer', viewerPass, 'I watch everything', 'user',
  );

  for (const uid of [adminId, creatorId, viewerId]) {
    db.prepare(`INSERT INTO playlists (id, user_id, title, description, visibility)
      VALUES (?, ?, 'Watch Later', 'Saved for later', 'private')`).run(id('pl'), uid);
  }

  db.prepare('INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)').run(viewerId, creatorId);

  const clips = [
    { file: 'seed_aurora.mp4', color: '0x0B3D4A', label: 'Aurora Drift', title: 'Aurora Drift — Opening Night', category: 'Film', tags: ['cinema', 'night'] },
    { file: 'seed_pulse.mp4', color: '0x1A1F2E', label: 'Signal Pulse', title: 'Signal Pulse: Live from the Lab', category: 'Tech', tags: ['tech', 'demo'] },
    { file: 'seed_harbor.mp4', color: '0x2C1810', label: 'Harbor Light', title: 'Harbor Light Documentary Cut', category: 'Documentary', tags: ['docs', 'city'] },
    { file: 'seed_velocity.mp4', color: '0x102A1A', label: 'Velocity', title: 'Velocity — Track Day Highlights', category: 'Sports', tags: ['sports', 'cars'] },
    { file: 'seed_orbit.mp4', color: '0x1C1030', label: 'Orbit', title: 'Orbit Briefing: Mission Day', category: 'Science', tags: ['space', 'science'] },
  ];

  for (const clip of clips) {
    try {
      const filePath = await makeClip(clip.file, clip.color, clip.label, 5);
      const meta = await probeVideo(filePath);
      const thumb = await generateThumbnail(filePath);
      const videoId = id('vid');
      db.prepare(`
        INSERT INTO videos (
          id, user_id, title, description, filename, thumbnail, duration, width, height,
          size_bytes, mime_type, visibility, is_encrypted, category, tags, views, likes_count, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'video/mp4', 'public', 0, ?, ?, ?, ?, 'ready')
      `).run(
        videoId, creatorId, clip.title,
        `${clip.title}. Seeded demo clip for EyeBox free video server.`,
        clip.file, thumb, meta.duration, meta.width, meta.height, meta.size || fs.statSync(filePath).size,
        clip.category, JSON.stringify(clip.tags),
        Math.floor(Math.random() * 5000) + 100,
        Math.floor(Math.random() * 200),
      );
      db.prepare(`INSERT INTO comments (id, video_id, user_id, body) VALUES (?, ?, ?, ?)`)
        .run(id('cmt'), videoId, viewerId, 'Looks incredible — love the EyeBox stream quality.');
      db.prepare('UPDATE videos SET comments_count = 1 WHERE id = ?').run(videoId);
    } catch (err) {
      console.warn('Clip failed:', clip.file, err.message);
    }
  }

  console.log('Seed complete.');
  console.log('Accounts:');
  console.log('  admin@eyebox.local / Admin@EyeBox2026!');
  console.log('  creator@eyebox.local / Creator@EyeBox2026!');
  console.log('  viewer@eyebox.local / Viewer@EyeBox2026!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
