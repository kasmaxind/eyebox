import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import { db, uploadsDir, thumbsDir } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed: ${code}`))));
    p.on("error", reject);
  });
}

function probeDuration(filePath) {
  return new Promise((resolve) => {
    const ff = spawn(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", filePath],
      { stdio: ["ignore", "pipe", "ignore"] }
    );
    let out = "";
    ff.stdout.on("data", (d) => (out += d.toString()));
    ff.on("close", () => resolve(parseFloat(out.trim()) || 0));
    ff.on("error", () => resolve(0));
  });
}

async function makeThumb(videoPath, thumbName) {
  const out = path.join(thumbsDir, thumbName);
  await run("ffmpeg", ["-y", "-ss", "0.5", "-i", videoPath, "-frames:v", "1", "-q:v", "3", out]);
  return thumbName;
}

/**
 * Generate short Creative-Commons-style demo clips with ffmpeg (no external download needed).
 */
async function generateClip(filename, opts) {
  const out = path.join(uploadsDir, filename);
  if (fs.existsSync(out) && fs.statSync(out).size > 1000) return out;

  const { color, text, duration = 8, pattern = "gradients" } = opts;
  const safeText = text.replace(/:/g, "\\:").replace(/'/g, "");
  const draw = `drawtext=text='${safeText}':fontsize=52:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.45:boxborderw=18`;

  const videoInput =
    pattern === "life"
      ? `life=s=1280x720:mold=0.1:rate=30,format=yuv420p,${draw}`
      : pattern === "plasma"
        ? `testsrc2=size=1280x720:rate=30,hue=h=${opts.hue || 40},format=yuv420p,${draw}`
        : `gradients=s=1280x720:c0=${color}:c1=0x050505:x0=0:y0=0:x1=1280:y1=720:n=2:seed=42,format=yuv420p,${draw}`;

  await run("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    videoInput,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=440:sample_rate=44100:duration=${duration}`,
    "-t",
    String(duration),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    out,
  ]);
  return out;
}

const channels = [
  { id: "ch_lenslab", name: "Lens Lab", handle: "lenslab", avatar_color: "#2EE6A6", subscribers: 128400 },
  { id: "ch_nightreel", name: "Night Reel", handle: "nightreel", avatar_color: "#FF4D2E", subscribers: 89200 },
  { id: "ch_frameforge", name: "Frame Forge", handle: "frameforge", avatar_color: "#5B8CFF", subscribers: 210300 },
  { id: "ch_pulsecast", name: "Pulse Cast", handle: "pulsecast", avatar_color: "#FFB020", subscribers: 55400 },
];

const demos = [
  {
    id: "dQw9demo001",
    channel_id: "ch_lenslab",
    title: "Golden Hour — Cinematic Color Study",
    description: "A short look at warm gradients and soft contrast — seeded demo for Eyebox streaming.",
    category: "Film",
    color: "0xFF8A3D",
    text: "Golden Hour",
    pattern: "gradients",
    views: 18420,
    likes: 932,
  },
  {
    id: "dQw9demo002",
    channel_id: "ch_nightreel",
    title: "Neon Drift — Night Drive Vibes",
    description: "Electric teal wash with a pulse tone. Demo clip streamed via HTTP Range requests.",
    category: "Music",
    color: "0x00C2A8",
    text: "Neon Drift",
    pattern: "gradients",
    views: 42100,
    likes: 2104,
  },
  {
    id: "dQw9demo003",
    channel_id: "ch_frameforge",
    title: "Signal Blue — UI Motion Tests",
    description: "Motion reference for product UI. Upload your own clips from the Upload page.",
    category: "Tech",
    color: "0x3D7EFF",
    text: "Signal Blue",
    pattern: "gradients",
    views: 9800,
    likes: 411,
  },
  {
    id: "dQw9demo004",
    channel_id: "ch_pulsecast",
    title: "Amber Pulse — Live Energy Check",
    description: "High-energy amber field. Perfect for testing the Eyebox player scrubbing.",
    category: "Live",
    color: "0xFFB020",
    text: "Amber Pulse",
    pattern: "gradients",
    views: 30550,
    likes: 1502,
  },
  {
    id: "dQw9demo005",
    channel_id: "ch_lenslab",
    title: "Organic Noise — Texture Loop",
    description: "Cellular automata texture generated with ffmpeg life filter.",
    category: "Art",
    color: "0x2EE6A6",
    text: "Organic Noise",
    pattern: "life",
    views: 12200,
    likes: 688,
  },
  {
    id: "dQw9demo006",
    channel_id: "ch_nightreel",
    title: "Crimson Cut — Trailer Tease",
    description: "Bold red field for trailer pacing. Comments and likes are fully interactive.",
    category: "Film",
    color: "0xE53935",
    text: "Crimson Cut",
    pattern: "gradients",
    views: 67300,
    likes: 4201,
  },
];

async function seed() {
  console.log("Seeding Eyebox…");

  const insertChannel = db.prepare(
    `INSERT OR REPLACE INTO channels (id, name, handle, avatar_color, subscribers)
     VALUES (@id, @name, @handle, @avatar_color, @subscribers)`
  );
  for (const c of channels) insertChannel.run(c);

  const insertVideo = db.prepare(
    `INSERT OR REPLACE INTO videos
     (id, channel_id, title, description, filename, thumbnail, duration, views, likes, category, created_at)
     VALUES
     (@id, @channel_id, @title, @description, @filename, @thumbnail, @duration, @views, @likes, @category, @created_at)`
  );

  const insertComment = db.prepare(
    `INSERT OR IGNORE INTO comments (id, video_id, author, body, created_at)
     VALUES (?, ?, ?, ?, datetime('now', ?))`
  );

  for (let i = 0; i < demos.length; i++) {
    const d = demos[i];
    const filename = `${d.id}.mp4`;
    console.log(`  generating ${d.title}…`);
    const filePath = await generateClip(filename, {
      color: d.color,
      text: d.text,
      pattern: d.pattern,
      duration: 8 + (i % 3),
    });
    const duration = await probeDuration(filePath);
    const thumbnail = await makeThumb(filePath, `${d.id}.jpg`);

    insertVideo.run({
      id: d.id,
      channel_id: d.channel_id,
      title: d.title,
      description: d.description,
      filename,
      thumbnail,
      duration,
      views: d.views,
      likes: d.likes,
      category: d.category,
      created_at: new Date(Date.now() - i * 36e5 * 8).toISOString().replace("T", " ").slice(0, 19),
    });

    insertComment.run(
      nanoid(8),
      d.id,
      "Maya R.",
      "Love the color grade on this — streaming is buttery smooth.",
      `-${i + 1} hours`
    );
    insertComment.run(
      nanoid(8),
      d.id,
      "Jon K.",
      "Eyebox player scrub works great with range requests.",
      `-${i + 2} hours`
    );
  }

  console.log("Seed complete. Demo videos are ready to stream.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
