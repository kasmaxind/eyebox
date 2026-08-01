import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { env, videoQualities } from '../config/env';
import { s3Service } from './s3.service';
import { VideoFileQuality } from '../types';

ffmpeg.setFfmpegPath(env.FFMPEG_PATH);
ffmpeg.setFfprobePath(env.FFPROBE_PATH);

interface ProbeResult {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
}

const QUALITY_MAP: Record<number, { width: number; height: number; bitrate: string }> = {
  360: { width: 640, height: 360, bitrate: '800k' },
  480: { width: 854, height: 480, bitrate: '1400k' },
  720: { width: 1280, height: 720, bitrate: '2800k' },
  1080: { width: 1920, height: 1080, bitrate: '5000k' },
  1440: { width: 2560, height: 1440, bitrate: '8000k' },
  2160: { width: 3840, height: 2160, bitrate: '15000k' },
};

export class FfmpegService {
  async probe(filePath: string): Promise<ProbeResult> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          codec: videoStream?.codec_name || 'unknown',
          bitrate: parseInt(String(metadata.format.bit_rate || 0), 10),
        });
      });
    });
  }

  async transcode(
    inputPath: string,
    outputDir: string,
    videoId: string,
    onProgress?: (percent: number) => void
  ): Promise<VideoFileQuality[]> {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const probe = await this.probe(inputPath);
    const sourceHeight = probe.height;
    const qualities = videoQualities.filter((q) => q <= sourceHeight);
    if (qualities.length === 0) qualities.push(360);

    const results: VideoFileQuality[] = [];
    let completed = 0;

    for (const quality of qualities) {
      const config = QUALITY_MAP[quality];
      if (!config) continue;

      const outputFile = path.join(outputDir, `${quality}p.mp4`);
      const s3Key = `videos/${videoId}/${quality}p.mp4`;

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-c:v libx264',
            '-preset fast',
            '-crf 23',
            '-c:a aac',
            '-b:a 128k',
            `-b:v ${config.bitrate}`,
            '-movflags +faststart',
          ])
          .size(`${config.width}x${config.height}`)
          .output(outputFile)
          .on('progress', (p) => {
            const overall = ((completed + (p.percent || 0) / 100) / qualities.length) * 100;
            onProgress?.(Math.min(overall, 99));
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      const url = await s3Service.uploadFromPath(s3Key, outputFile);
      results.push({
        quality,
        url,
        bitrate: parseInt(config.bitrate.replace('k', ''), 10) * 1000,
        width: config.width,
        height: config.height,
        codec: 'h264',
      });

      completed++;
      onProgress?.((completed / qualities.length) * 100);
    }

    return results;
  }

  async extractThumbnails(
    inputPath: string,
    outputDir: string,
    videoId: string,
    count = env.THUMBNAIL_COUNT
  ): Promise<string[]> {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const probe = await this.probe(inputPath);
    const interval = probe.duration / (count + 1);
    const urls: string[] = [];

    for (let i = 1; i <= count; i++) {
      const timestamp = interval * i;
      const outputFile = path.join(outputDir, `thumb-${i}.jpg`);
      const s3Key = `videos/${videoId}/thumbnails/thumb-${i}.jpg`;

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .seekInput(timestamp)
          .frames(1)
          .output(outputFile)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      const url = await s3Service.uploadFromPath(s3Key, outputFile);
      urls.push(url);
    }

    return urls;
  }

  generateAdaptivePlaylist(videoFiles: VideoFileQuality[]): object {
    const sorted = [...videoFiles].sort((a, b) => a.quality - b.quality);
    return {
      type: 'adaptive',
      format: 'mp4-ladder',
      variants: sorted.map((f) => ({
        quality: f.quality,
        url: f.url,
        bandwidth: f.bitrate || 0,
        resolution: `${f.width}x${f.height}`,
        codec: f.codec,
      })),
      defaultQuality: sorted[sorted.length - 1]?.quality || 720,
    };
  }
}

export const ffmpegService = new FfmpegService();
