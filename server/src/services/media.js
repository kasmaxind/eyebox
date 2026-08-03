import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { env } from '../config.js';
import { nanoid } from 'nanoid';

export function probeVideo(filePath) {
  return new Promise((resolve) => {
    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ];
    const proc = spawn('ffprobe', args);
    let out = '';
    proc.stdout.on('data', (d) => { out += d; });
    proc.on('close', () => {
      try {
        const data = JSON.parse(out || '{}');
        const video = (data.streams || []).find((s) => s.codec_type === 'video') || {};
        resolve({
          duration: Number(data.format?.duration || 0),
          width: Number(video.width || 0),
          height: Number(video.height || 0),
          size: Number(data.format?.size || 0),
          mimeType: 'video/mp4',
        });
      } catch {
        resolve({ duration: 0, width: 0, height: 0, size: 0, mimeType: 'video/mp4' });
      }
    });
    proc.on('error', () => resolve({ duration: 0, width: 0, height: 0, size: 0, mimeType: 'video/mp4' }));
  });
}

export function generateThumbnail(filePath) {
  return new Promise((resolve) => {
    const name = `${nanoid(14)}.jpg`;
    const out = path.join(env.dataDir, 'thumbs', name);
    const args = [
      '-y', '-ss', '1', '-i', filePath,
      '-frames:v', '1', '-q:v', '3',
      '-vf', 'scale=640:-1',
      out,
    ];
    const proc = spawn('ffmpeg', args, { stdio: 'ignore' });
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(out)) resolve(name);
      else resolve(null);
    });
    proc.on('error', () => resolve(null));
  });
}

/** Optional HLS ladder for adaptive playback of public videos */
export function generateHls(filePath, videoId) {
  return new Promise((resolve) => {
    const outDir = path.join(env.dataDir, 'hls', videoId);
    fs.mkdirSync(outDir, { recursive: true });
    const playlist = path.join(outDir, 'index.m3u8');
    const args = [
      '-y', '-i', filePath,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28',
      '-c:a', 'aac', '-b:a', '128k',
      '-hls_time', '4',
      '-hls_playlist_type', 'vod',
      '-hls_segment_filename', path.join(outDir, 'seg_%03d.ts'),
      playlist,
    ];
    const proc = spawn('ffmpeg', args, { stdio: 'ignore' });
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch { /* ignore */ }
      resolve(null);
    }, 120000);
    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve(code === 0 && fs.existsSync(playlist) ? `hls/${videoId}/index.m3u8` : null);
    });
    proc.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}
