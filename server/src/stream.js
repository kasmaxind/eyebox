import fs from "fs";
import path from "path";
import mime from "mime-types";
import { uploadsDir } from "./db.js";

/**
 * Stream a video file with HTTP Range support (YouTube-style progressive playback).
 */
export function streamVideo(req, res, filename) {
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Video file not found" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const contentType = mime.lookup(filePath) || "video/mp4";
  const range = req.headers.range;

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  if (!range) {
    res.setHeader("Content-Length", fileSize);
    return fs.createReadStream(filePath).pipe(res);
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  if (Number.isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
    res.status(416);
    res.setHeader("Content-Range", `bytes */${fileSize}`);
    return res.end();
  }

  const chunkSize = end - start + 1;
  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
  res.setHeader("Content-Length", chunkSize);

  fs.createReadStream(filePath, { start, end }).pipe(res);
}
