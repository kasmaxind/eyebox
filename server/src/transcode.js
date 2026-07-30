import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { nanoid } from "nanoid";
import { db, uploadsDir } from "./db.js";

const hlsRoot = path.join(uploadsDir, "hls");
const subsRoot = path.join(uploadsDir, "subtitles");
const audioRoot = path.join(uploadsDir, "audio");

fs.mkdirSync(hlsRoot, { recursive: true });
fs.mkdirSync(subsRoot, { recursive: true });
fs.mkdirSync(audioRoot, { recursive: true });

/** Full quality ladder — higher tiers are included when source allows upscaling. */
export const QUALITY_LADDER = [
  { quality: "144p", height: 144, width: 256, vBitrate: "200k", aBitrate: "64k" },
  { quality: "360p", height: 360, width: 640, vBitrate: "800k", aBitrate: "96k" },
  { quality: "480p", height: 480, width: 854, vBitrate: "1400k", aBitrate: "96k" },
  { quality: "720p", height: 720, width: 1280, vBitrate: "2800k", aBitrate: "128k" },
  { quality: "1080p", height: 1080, width: 1920, vBitrate: "5000k", aBitrate: "192k" },
  { quality: "1440p", height: 1440, width: 2560, vBitrate: "8000k", aBitrate: "192k" },
  { quality: "2160p", height: 2160, width: 3840, vBitrate: "16000k", aBitrate: "256k" },
  { quality: "4320p", height: 4320, width: 7680, vBitrate: "40000k", aBitrate: "256k" },
];

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr?.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed (${code}): ${err.slice(-400)}`))));
    p.on("error", reject);
  });
}

export function probeVideo(filePath) {
  return new Promise((resolve) => {
    const ff = spawn(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,r_frame_rate,codec_name",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        filePath,
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );
    let out = "";
    ff.stdout.on("data", (d) => (out += d.toString()));
    ff.on("close", () => {
      try {
        const data = JSON.parse(out);
        const stream = data.streams?.[0] || {};
        const fpsParts = (stream.r_frame_rate || "30/1").split("/");
        const fps = Math.round(Number(fpsParts[0]) / (Number(fpsParts[1]) || 1)) || 30;
        resolve({
          width: stream.width || 1280,
          height: stream.height || 720,
          fps,
          codec: stream.codec_name || "h264",
          duration: parseFloat(data.format?.duration) || 0,
        });
      } catch {
        resolve({ width: 1280, height: 720, fps: 30, codec: "h264", duration: 0 });
      }
    });
    ff.on("error", () => resolve({ width: 1280, height: 720, fps: 30, codec: "h264", duration: 0 }));
  });
}

function ladderForSource(sourceHeight, includeUpscale = true, tier = "standard") {
  if (tier === "full" && includeUpscale) return QUALITY_LADDER;
  if (tier === "minimal") {
    return QUALITY_LADDER.filter((q) => ["144p", "360p", "720p"].includes(q.quality));
  }
  return QUALITY_LADDER.filter((q) => ["144p", "360p", "720p", "1080p"].includes(q.quality));
}

function writeMasterPlaylist(dir, variants, audioTracks = []) {
  const lines = ["#EXTM3U", "#EXT-X-VERSION:6"];

  for (const a of audioTracks) {
    lines.push(
      `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="${a.label}",LANGUAGE="${a.language}",DEFAULT=${a.isDefault ? "YES" : "NO"},AUTOSELECT=YES,URI="${a.uri}"`
    );
  }

  const audioGroup = audioTracks.length ? ',AUDIO="audio"' : "";

  for (const v of variants) {
    const codecs = v.codec === "h264" ? "avc1.640028,mp4a.40.2" : v.codec === "vp9" ? "vp9,opus" : "av01.0.05M.08,mp4a.40.2";
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${v.bandwidth},RESOLUTION=${v.width}x${v.height},FRAME-RATE=${v.fps},CODECS="${codecs}"${v.hdr ? ",VIDEO-RANGE=PQ" : ""}${audioGroup}`,
      v.playlist
    );
  }

  fs.writeFileSync(path.join(dir, "master.m3u8"), lines.join("\n") + "\n");
  return "master.m3u8";
}

async function transcodeHlsVariant(sourcePath, outDir, q, { fps = 30, hdr = false, audioPath = null }) {
  fs.mkdirSync(outDir, { recursive: true });
  const playlist = "playlist.m3u8";
  const input = audioPath || sourcePath;

  const vf = `scale=${q.width}:${q.height}:flags=lanczos`;

  const args = [
    "-y",
    "-i",
    sourcePath,
    ...(audioPath ? ["-i", audioPath] : []),
    "-vf",
    vf,
    "-r",
    String(fps),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-profile:v",
    "high",
    "-b:v",
    q.vBitrate,
    "-maxrate",
    q.vBitrate,
    "-bufsize",
    `${parseInt(q.vBitrate) * 2}k`,
    "-c:a",
    "aac",
    "-b:a",
    q.aBitrate,
    "-ac",
    "2",
    "-map",
    "0:v:0",
    "-map",
    audioPath ? "1:a:0" : "0:a:0?",
    "-f",
    "hls",
    "-hls_time",
    "4",
    "-hls_playlist_type",
    "vod",
    "-hls_segment_filename",
    path.join(outDir, "seg%03d.ts"),
    path.join(outDir, playlist),
  ];

  await run("ffmpeg", args);
  return playlist;
}

async function transcodeCodecFile(sourcePath, outPath, codec, q, fps = 30) {
  const vf = `scale=${q.width}:${q.height}:flags=lanczos`;
  const base = ["-y", "-i", sourcePath, "-vf", vf, "-r", String(fps), "-c:a", "aac", "-b:a", q.aBitrate];

  if (codec === "vp9") {
    await run("ffmpeg", [
      ...base,
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      q.vBitrate,
      "-f",
      "webm",
      outPath,
    ]);
  } else if (codec === "av1") {
    await run("ffmpeg", [
      ...base,
      "-c:v",
      "libaom-av1",
      "-cpu-used",
      "6",
      "-b:v",
      q.vBitrate,
      "-f",
      "mp4",
      outPath,
    ]);
  } else {
    await run("ffmpeg", [
      ...base,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-b:v",
      q.vBitrate,
      "-f",
      "mp4",
      outPath,
    ]);
  }
}

async function generateAudioTrack(sourcePath, outPath, language) {
  const pitch = language === "es" ? "0.92" : "1.0";
  await run("ffmpeg", [
    "-y",
    "-i",
    sourcePath,
    "-af",
    `asetrate=44100*${pitch},aresample=44100`,
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    outPath,
  ]);
}

export function writeSubtitleVtt(videoId, language, label, kind, cues) {
  const dir = path.join(subsRoot, videoId);
  fs.mkdirSync(dir, { recursive: true });
  const file = `${language}-${kind}.vtt`;
  const lines = ["WEBVTT", `NOTE ${label}`, ""];
  for (const cue of cues) {
    lines.push(`${cue.start} --> ${cue.end}`, cue.text, "");
  }
  fs.writeFileSync(path.join(dir, file), lines.join("\n"));
  return file;
}

function defaultCues(title, language) {
  if (language === "es") {
    return [
      { start: "00:00:00.500", end: "00:00:03.500", text: `[Auto] Bienvenido a ${title}` },
      { start: "00:00:04.000", end: "00:00:07.500", text: "[Auto] Transmisión adaptativa con subtítulos" },
      { start: "00:00:08.000", end: "00:00:11.000", text: "[Auto] Calidad ajustada a tu conexión" },
    ];
  }
  return [
    { start: "00:00:00.500", end: "00:00:03.500", text: `Welcome to ${title}` },
    { start: "00:00:04.000", end: "00:00:07.500", text: "Adaptive streaming with captions enabled" },
    { start: "00:00:08.000", end: "00:00:11.000", text: "Quality adjusts to your connection speed" },
  ];
}

function parseBitrate(b) {
  const n = parseInt(b, 10);
  return Number.isFinite(n) ? n * 1000 : 1000000;
}

export async function buildPlaybackPackage(videoId, sourcePath, opts = {}) {
  const {
    title = "Video",
    includeUpscale = true,
    fps = 30,
    hdr = false,
    withAltAudio = true,
    withSubtitles = true,
    withAltCodecs = true,
    tier = "standard",
  } = opts;

  const probe = await probeVideo(sourcePath);
  const effectiveFps = opts.fps || probe.fps;
  const videoDir = path.join(hlsRoot, videoId);
  if (fs.existsSync(path.join(videoDir, "master.m3u8"))) {
    return loadPlaybackFromDb(videoId);
  }

  fs.mkdirSync(videoDir, { recursive: true });
  const ladder = ladderForSource(probe.height, includeUpscale, tier);
  const variants = [];

  db.prepare("DELETE FROM video_renditions WHERE video_id = ?").run(videoId);
  db.prepare("DELETE FROM video_subtitles WHERE video_id = ?").run(videoId);
  db.prepare("DELETE FROM video_audio_tracks WHERE video_id = ?").run(videoId);
  db.prepare("DELETE FROM playback_packages WHERE video_id = ?").run(videoId);

  let altAudioPath = null;
  const audioTracks = [];

  if (withAltAudio) {
    const enFile = `${videoId}-en.m4a`;
    const esFile = `${videoId}-es.m4a`;
    await generateAudioTrack(sourcePath, path.join(audioRoot, enFile), "en");
    await generateAudioTrack(sourcePath, path.join(audioRoot, esFile), "es");
    altAudioPath = path.join(audioRoot, esFile);

    db.prepare(
      `INSERT INTO video_audio_tracks (id, video_id, language, label, filename, is_default)
       VALUES (?, ?, 'en', 'English', ?, 1)`
    ).run(nanoid(8), videoId, enFile);

    db.prepare(
      `INSERT INTO video_audio_tracks (id, video_id, language, label, filename, is_default)
       VALUES (?, ?, 'es', 'Español', ?, 0)`
    ).run(nanoid(8), videoId, esFile);

    const esHlsDir = path.join(videoDir, "audio-es");
    fs.mkdirSync(esHlsDir, { recursive: true });
    await run("ffmpeg", [
      "-y",
      "-i",
      path.join(audioRoot, esFile),
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-f",
      "hls",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      path.join(esHlsDir, "seg%03d.ts"),
      path.join(esHlsDir, "playlist.m3u8"),
    ]);
    audioTracks.push({
      language: "es",
      label: "Español",
      isDefault: false,
      uri: "audio-es/playlist.m3u8",
    });
    audioTracks.unshift({
      language: "en",
      label: "English",
      isDefault: true,
      uri: "audio-en/playlist.m3u8",
    });

    const enHlsDir = path.join(videoDir, "audio-en");
    fs.mkdirSync(enHlsDir, { recursive: true });
    await run("ffmpeg", [
      "-y",
      "-i",
      path.join(audioRoot, enFile),
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-f",
      "hls",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      path.join(enHlsDir, "seg%03d.ts"),
      path.join(enHlsDir, "playlist.m3u8"),
    ]);
  }

  for (const q of ladder) {
    const variantDir = path.join(videoDir, q.quality);
    console.log(`    HLS ${q.quality}…`);
    await transcodeHlsVariant(sourcePath, variantDir, q, { fps: effectiveFps, hdr });
    const bandwidth = parseBitrate(q.vBitrate) + parseBitrate(q.aBitrate);
    variants.push({
      quality: q.quality,
      width: q.width,
      height: q.height,
      fps: effectiveFps,
      codec: "h264",
      hdr,
      bandwidth,
      playlist: `${q.quality}/playlist.m3u8`,
    });

    db.prepare(
      `INSERT INTO video_renditions (id, video_id, quality, width, height, fps, codec, hdr, bitrate, hls_playlist)
       VALUES (?, ?, ?, ?, ?, ?, 'h264', ?, ?, ?)`
    ).run(
      nanoid(10),
      videoId,
      q.quality,
      q.width,
      q.height,
      effectiveFps,
      hdr ? 1 : 0,
      bandwidth,
      `hls/${videoId}/${q.quality}/playlist.m3u8`
    );
  }

  writeMasterPlaylist(videoDir, variants, audioTracks);

  if (withAltCodecs) {
    const q720 = ladder.find((q) => q.quality === "720p") || ladder[ladder.length - 1];
    const vp9Name = `${videoId}-vp9.webm`;
    const av1Name = `${videoId}-av1.mp4`;
    console.log("    VP9 + AV1 renditions…");
    try {
      await transcodeCodecFile(sourcePath, path.join(uploadsDir, vp9Name), "vp9", q720, effectiveFps);
      db.prepare(
        `INSERT INTO video_renditions (id, video_id, quality, width, height, fps, codec, hdr, bitrate, filename)
         VALUES (?, ?, '720p', ?, ?, ?, 'vp9', ?, ?, ?)`
      ).run(nanoid(10), videoId, q720.width, q720.height, effectiveFps, hdr ? 1 : 0, parseBitrate(q720.vBitrate), vp9Name);
    } catch (e) {
      console.warn("    VP9 skipped:", e.message);
    }
    try {
      await transcodeCodecFile(sourcePath, path.join(uploadsDir, av1Name), "av1", q720, effectiveFps);
      db.prepare(
        `INSERT INTO video_renditions (id, video_id, quality, width, height, fps, codec, hdr, bitrate, filename)
         VALUES (?, ?, '720p', ?, ?, ?, 'av1', ?, ?, ?)`
      ).run(nanoid(10), videoId, q720.width, q720.height, effectiveFps, hdr ? 1 : 0, parseBitrate(q720.vBitrate), av1Name);
    } catch (e) {
      console.warn("    AV1 skipped:", e.message);
    }
  }

  if (withSubtitles) {
    for (const [lang, label, kind] of [
      ["en", "English", "manual"],
      ["es", "Español (auto)", "auto"],
    ]) {
      const vtt = writeSubtitleVtt(videoId, lang, label, kind, defaultCues(title, lang));
      db.prepare(
        `INSERT INTO video_subtitles (id, video_id, language, label, kind, vtt_file)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(nanoid(8), videoId, lang, label, kind, vtt);
    }
  }

  db.prepare(
    `INSERT INTO playback_packages (video_id, hls_master, max_fps, hdr, has_hls)
     VALUES (?, ?, ?, ?, 1)`
  ).run(videoId, `hls/${videoId}/master.m3u8`, effectiveFps, hdr ? 1 : 0);

  return loadPlaybackFromDb(videoId);
}

export function loadPlaybackFromDb(videoId) {
  const pkg = db.prepare("SELECT * FROM playback_packages WHERE video_id = ?").get(videoId);
  const renditions = db
    .prepare("SELECT * FROM video_renditions WHERE video_id = ? ORDER BY height ASC")
    .all(videoId);
  const subtitles = db
    .prepare("SELECT * FROM video_subtitles WHERE video_id = ? ORDER BY language ASC")
    .all(videoId);
  const audioTracks = db
    .prepare("SELECT * FROM video_audio_tracks WHERE video_id = ? ORDER BY is_default DESC")
    .all(videoId);

  return { package: pkg, renditions, subtitles, audioTracks };
}

export function getHlsDir(videoId) {
  return path.join(hlsRoot, videoId);
}
