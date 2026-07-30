import { Router } from "express";
import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { db, uploadsDir, thumbsDir } from "./db.js";
import { streamVideo } from "./stream.js";
import { buildPlaybackPackage, loadPlaybackFromDb } from "./transcode.js";

const router = Router();

router.use(
  "/hls",
  express.static(path.join(uploadsDir, "hls"), {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      } else if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
      }
      res.setHeader("Cache-Control", "public, max-age=31536000");
    },
  })
);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".mp4";
    cb(null, `${nanoid(12)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^video\//.test(file.mimetype) || /\.(mp4|webm|mov|mkv|ogv)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

function probeDuration(filePath) {
  return new Promise((resolve) => {
    const ff = spawn(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", filePath],
      { stdio: ["ignore", "pipe", "ignore"] }
    );
    let out = "";
    ff.stdout.on("data", (d) => (out += d.toString()));
    ff.on("close", () => {
      const n = parseFloat(out.trim());
      resolve(Number.isFinite(n) ? n : 0);
    });
    ff.on("error", () => resolve(0));
  });
}

function makeThumbnail(videoPath, thumbName) {
  return new Promise((resolve) => {
    const out = path.join(thumbsDir, thumbName);
    const ff = spawn(
      "ffmpeg",
      ["-y", "-ss", "1", "-i", videoPath, "-frames:v", "1", "-q:v", "3", out],
      { stdio: "ignore" }
    );
    ff.on("close", (code) => resolve(code === 0 && fs.existsSync(out) ? thumbName : null));
    ff.on("error", () => resolve(null));
  });
}

function mapVideo(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    duration: row.duration,
    views: row.views,
    likes: row.likes,
    category: row.category,
    createdAt: row.created_at,
    streamUrl: `/api/stream/${row.id}`,
    thumbnailUrl: row.thumbnail ? `/api/thumbs/${row.thumbnail}` : null,
    channel: {
      id: row.channel_id,
      name: row.channel_name,
      handle: row.channel_handle,
      avatarColor: row.avatar_color,
      subscribers: row.subscribers,
    },
  };
}

const videoSelect = `
  SELECT v.*,
    c.name AS channel_name,
    c.handle AS channel_handle,
    c.avatar_color AS avatar_color,
    c.subscribers AS subscribers
  FROM videos v
  JOIN channels c ON c.id = v.channel_id
`;

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "eyebox-stream" });
});

router.get("/videos", (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const category = (req.query.category || "").toString().trim();
  const sort = (req.query.sort || "latest").toString();
  const limit = Math.min(parseInt(req.query.limit || "48", 10) || 48, 100);

  let where = "WHERE 1=1";
  const params = [];

  if (q) {
    where += " AND (v.title LIKE ? OR v.description LIKE ? OR c.name LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (category && category !== "All") {
    where += " AND v.category = ?";
    params.push(category);
  }

  const order =
    sort === "popular"
      ? "ORDER BY v.views DESC, v.created_at DESC"
      : sort === "liked"
        ? "ORDER BY v.likes DESC, v.created_at DESC"
        : "ORDER BY v.created_at DESC";

  const rows = db
    .prepare(`${videoSelect} ${where} ${order} LIMIT ?`)
    .all(...params, limit);

  res.json({ videos: rows.map(mapVideo) });
});

function mapPlayback(videoId) {
  const data = loadPlaybackFromDb(videoId);
  const pkg = data.package;
  if (!pkg?.has_hls) {
    return {
      adaptive: false,
      streamUrl: `/api/stream/${videoId}`,
      renditions: [],
      subtitles: [],
      audioTracks: [],
      maxFps: 30,
      hdr: false,
    };
  }

  return {
    adaptive: true,
    hlsUrl: `/api/hls/${videoId}/master.m3u8`,
    streamUrl: `/api/stream/${videoId}`,
    maxFps: pkg.max_fps,
    hdr: !!pkg.hdr,
    renditions: data.renditions.map((r) => ({
      id: r.id,
      quality: r.quality,
      width: r.width,
      height: r.height,
      fps: r.fps,
      codec: r.codec,
      hdr: !!r.hdr,
      bitrate: r.bitrate,
      hlsPlaylist: r.hls_playlist ? `/api/${r.hls_playlist}` : null,
      streamUrl: r.filename
        ? `/api/stream-file/${videoId}/${r.codec}/${r.quality}`
        : null,
    })),
    subtitles: data.subtitles.map((s) => ({
      id: s.id,
      language: s.language,
      label: s.label,
      kind: s.kind,
      url: `/api/subtitles/${videoId}/${s.vtt_file}`,
    })),
    audioTracks: data.audioTracks.map((a) => ({
      id: a.id,
      language: a.language,
      label: a.label,
      isDefault: !!a.is_default,
      url: `/api/audio/${videoId}/${a.filename}`,
    })),
  };
}

router.get("/videos/:id/playback", (req, res) => {
  const video = db.prepare("SELECT id FROM videos WHERE id = ?").get(req.params.id);
  if (!video) return res.status(404).json({ error: "Video not found" });
  res.json(mapPlayback(req.params.id));
});

router.get("/videos/:id", (req, res) => {
  const row = db.prepare(`${videoSelect} WHERE v.id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: "Video not found" });

  db.prepare("UPDATE videos SET views = views + 1 WHERE id = ?").run(req.params.id);
  const updated = db.prepare(`${videoSelect} WHERE v.id = ?`).get(req.params.id);

  const comments = db
    .prepare(
      `SELECT id, author, body, created_at AS createdAt
       FROM comments WHERE video_id = ? ORDER BY created_at DESC LIMIT 100`
    )
    .all(req.params.id);

  const related = db
    .prepare(
      `${videoSelect}
       WHERE v.id != ? AND (v.category = ? OR v.channel_id = ?)
       ORDER BY v.views DESC LIMIT 12`
    )
    .all(req.params.id, updated.category, updated.channel_id)
    .map(mapVideo);

  res.json({ video: mapVideo(updated), comments, related });
});

router.post("/videos/:id/like", (req, res) => {
  const info = db.prepare("UPDATE videos SET likes = likes + 1 WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "Video not found" });
  const likes = db.prepare("SELECT likes FROM videos WHERE id = ?").get(req.params.id).likes;
  res.json({ likes });
});

router.post("/videos/:id/comments", (req, res) => {
  const { author, body } = req.body || {};
  if (!body || !String(body).trim()) {
    return res.status(400).json({ error: "Comment body required" });
  }
  const video = db.prepare("SELECT id FROM videos WHERE id = ?").get(req.params.id);
  if (!video) return res.status(404).json({ error: "Video not found" });

  const id = nanoid(10);
  db.prepare(
    "INSERT INTO comments (id, video_id, author, body) VALUES (?, ?, ?, ?)"
  ).run(id, req.params.id, (author && String(author).trim()) || "Guest", String(body).trim());

  const comment = db
    .prepare(
      `SELECT id, author, body, created_at AS createdAt FROM comments WHERE id = ?`
    )
    .get(id);
  res.status(201).json({ comment });
});

router.get("/categories", (_req, res) => {
  const rows = db
    .prepare("SELECT DISTINCT category FROM videos ORDER BY category ASC")
    .all();
  res.json({ categories: ["All", ...rows.map((r) => r.category)] });
});

router.get("/channels/:handle", (req, res) => {
  const channel = db
    .prepare(
      `SELECT id, name, handle, avatar_color AS avatarColor, subscribers, created_at AS createdAt
       FROM channels WHERE handle = ?`
    )
    .get(req.params.handle);
  if (!channel) return res.status(404).json({ error: "Channel not found" });

  const videos = db
    .prepare(`${videoSelect} WHERE v.channel_id = ? ORDER BY v.created_at DESC`)
    .all(channel.id)
    .map(mapVideo);

  res.json({ channel, videos });
});

router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No video file uploaded" });

    const title = (req.body.title || req.file.originalname).toString().trim().slice(0, 120);
    const description = (req.body.description || "").toString().trim().slice(0, 5000);
    const category = (req.body.category || "General").toString().trim().slice(0, 40);
    const channelName = (req.body.channelName || "You").toString().trim().slice(0, 60);

    let channel = db
      .prepare("SELECT * FROM channels WHERE handle = ?")
      .get("you");

    if (!channel) {
      const channelId = nanoid(10);
      db.prepare(
        `INSERT INTO channels (id, name, handle, avatar_color, subscribers)
         VALUES (?, ?, 'you', '#FF4D2E', 1)`
      ).run(channelId, channelName || "You");
      channel = db.prepare("SELECT * FROM channels WHERE id = ?").get(channelId);
    } else if (channelName && channelName !== channel.name) {
      db.prepare("UPDATE channels SET name = ? WHERE id = ?").run(channelName, channel.id);
    }

    const videoId = nanoid(11);
    const filePath = path.join(uploadsDir, req.file.filename);
    const duration = await probeDuration(filePath);
    const thumbName = `${videoId}.jpg`;
    const thumbnail = await makeThumbnail(filePath, thumbName);

    db.prepare(
      `INSERT INTO videos (id, channel_id, title, description, filename, thumbnail, duration, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      videoId,
      channel.id,
      title,
      description,
      req.file.filename,
      thumbnail,
      duration,
      category || "General"
    );

    const row = db.prepare(`${videoSelect} WHERE v.id = ?`).get(videoId);

    buildPlaybackPackage(videoId, filePath, {
      title,
      tier: "standard",
      withAltAudio: true,
      withSubtitles: true,
      withAltCodecs: false,
    }).catch((err) => console.error("Transcode failed:", err));

    res.status(201).json({ video: mapVideo(row) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

router.get("/stream/:id", (req, res) => {
  const video = db.prepare("SELECT filename FROM videos WHERE id = ?").get(req.params.id);
  if (!video) return res.status(404).json({ error: "Video not found" });
  streamVideo(req, res, video.filename);
});

router.get("/stream-file/:videoId/:codec/:quality", (req, res) => {
  const row = db
    .prepare(
      `SELECT filename FROM video_renditions
       WHERE video_id = ? AND codec = ? AND quality = ? AND filename IS NOT NULL`
    )
    .get(req.params.videoId, req.params.codec, req.params.quality);
  if (!row) return res.status(404).json({ error: "Rendition not found" });
  streamVideo(req, res, row.filename);
});

router.get("/subtitles/:videoId/:file", (req, res) => {
  const filePath = path.join(
    uploadsDir,
    "subtitles",
    req.params.videoId,
    path.basename(req.params.file)
  );
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.setHeader("Content-Type", "text/vtt; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(filePath);
});

router.get("/audio/:videoId/:file", (req, res) => {
  const name = path.basename(req.params.file);
  const filePath = path.join(uploadsDir, "audio", name);
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.setHeader("Content-Type", "audio/mp4");
  const stat = fs.statSync(filePath);
  res.setHeader("Content-Length", stat.size);
  fs.createReadStream(filePath).pipe(res);
});

router.get("/thumbs/:name", (req, res) => {
  const name = path.basename(req.params.name);
  const filePath = path.join(thumbsDir, name);
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(filePath);
});

export default router;
