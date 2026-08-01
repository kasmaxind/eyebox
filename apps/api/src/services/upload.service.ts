import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getRedis, redisKeys } from '../config/redis';
import { env } from '../config/env';
import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { videoService } from './video.service';
import { ffmpegService } from './ffmpeg.service';
import { aiService } from './ai.service';
import { s3Service } from './s3.service';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { UploadSession } from '../types';
import sharp from 'sharp';

export class UploadService {
  async initSession(userId: string, channelId: string, filename: string, totalSize: number, totalChunks: number) {
    const channel = await Channel.findById(channelId);
    if (!channel || channel.owner.toString() !== userId) {
      throw new ForbiddenError('Not authorized for this channel');
    }

    const sessionId = uuidv4();
    const video = await videoService.create({
      channelId,
      uploaderId: userId,
      title: filename.replace(/\.[^.]+$/, ''),
      visibility: 'private',
    });

    const session: UploadSession = {
      sessionId,
      userId,
      channelId,
      filename,
      totalChunks,
      receivedChunks: 0,
      totalSize,
      status: 'pending',
      videoId: video._id.toString(),
      createdAt: new Date().toISOString(),
    };

    const redis = getRedis();
    await redis.setex(redisKeys.uploadSession(sessionId), 86400, JSON.stringify(session));

    const uploadDir = path.resolve(process.cwd(), env.LOCAL_UPLOAD_DIR, 'temp', sessionId);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    return { sessionId, videoId: video._id.toString() };
  }

  async receiveChunk(sessionId: string, chunkIndex: number, filePath: string) {
    const redis = getRedis();
    const sessionData = await redis.get(redisKeys.uploadSession(sessionId));
    if (!sessionData) throw new NotFoundError('Upload session not found');

    const session: UploadSession = JSON.parse(sessionData);
    session.receivedChunks++;
    session.status = 'uploading';

    const progress = Math.round((session.receivedChunks / session.totalChunks) * 100);
    await redis.set(redisKeys.uploadSession(sessionId), JSON.stringify(session));
    await redis.set(redisKeys.uploadProgress(sessionId), String(progress));

    return { progress, receivedChunks: session.receivedChunks, totalChunks: session.totalChunks };
  }

  async completeUpload(sessionId: string, userId: string, io?: { emit: (event: string, data: unknown) => void }) {
    const redis = getRedis();
    const sessionData = await redis.get(redisKeys.uploadSession(sessionId));
    if (!sessionData) throw new NotFoundError('Upload session not found');

    const session: UploadSession = JSON.parse(sessionData);
    if (session.userId !== userId) throw new ForbiddenError('Not authorized');

    const uploadDir = path.resolve(process.cwd(), env.LOCAL_UPLOAD_DIR, 'temp', sessionId);
    const outputPath = path.join(uploadDir, 'complete.mp4');

    const chunkFiles = fs
      .readdirSync(uploadDir)
      .filter((f) => f.startsWith('chunk-'))
      .sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));

    const writeStream = fs.createWriteStream(outputPath);
    for (const chunk of chunkFiles) {
      const chunkPath = path.join(uploadDir, chunk);
      const data = fs.readFileSync(chunkPath);
      writeStream.write(data);
    }
    writeStream.end();
    await new Promise<void>((resolve) => writeStream.on('finish', resolve));

    session.status = 'processing';
    await redis.set(redisKeys.uploadSession(sessionId), JSON.stringify(session));

    const videoId = session.videoId!;
    await Video.updateOne({ _id: videoId }, { status: 'processing', processingProgress: 0 });

    const processDir = path.resolve(process.cwd(), env.LOCAL_UPLOAD_DIR, 'processing', videoId);
    if (!fs.existsSync(processDir)) fs.mkdirSync(processDir, { recursive: true });

    const emitProgress = (percent: number) => {
      const p = Math.round(percent);
      redis.set(redisKeys.uploadProgress(sessionId), String(p));
      Video.updateOne({ _id: videoId }, { processingProgress: p }).exec();
      if (io) io.emit('upload:progress', { sessionId, videoId, progress: p });
    };

    try {
      const probe = await ffmpegService.probe(outputPath);
      const videoFiles = await ffmpegService.transcode(outputPath, processDir, videoId, emitProgress);
      const thumbnailUrls = await ffmpegService.extractThumbnails(outputPath, processDir, videoId);

      const video = await Video.findById(videoId);
      if (!video) throw new NotFoundError('Video not found');

      const thumbnails = thumbnailUrls.map((url, i) => ({
        url,
        isAuto: true,
        isSelected: i === aiService.scoreThumbnail(thumbnailUrls, video.title),
      }));

      const category = await import('../models/Category').then((m) =>
        m.Category.findById(video.category)
      );

      video.duration = Math.round(probe.duration);
      video.videoFiles = videoFiles;
      video.thumbnails = thumbnails;
      video.status = 'ready';
      video.processingProgress = 100;
      video.aiSummary = aiService.generateSummary(video.title, video.description, video.tags);
      video.aiChapters = aiService.generateChapters(probe.duration, video.title);
      await video.save();

      session.status = 'complete';
      await redis.set(redisKeys.uploadSession(sessionId), JSON.stringify(session));
      await redis.set(redisKeys.uploadProgress(sessionId), '100');

      if (io) io.emit('upload:complete', { sessionId, videoId });

      fs.rmSync(uploadDir, { recursive: true, force: true });
      return { videoId, status: 'ready', duration: video.duration };
    } catch (error) {
      await Video.updateOne({ _id: videoId }, { status: 'failed' });
      session.status = 'failed';
      await redis.set(redisKeys.uploadSession(sessionId), JSON.stringify(session));
      throw error;
    }
  }

  async uploadThumbnail(videoId: string, userId: string, filePath: string) {
    const video = await Video.findById(videoId);
    if (!video) throw new NotFoundError('Video not found');

    const channel = await Channel.findById(video.channel);
    if (!channel || channel.owner.toString() !== userId) throw new ForbiddenError('Not authorized');

    const resized = path.join(path.dirname(filePath), 'resized.jpg');
    await sharp(filePath).resize(1280, 720, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(resized);

    const key = `videos/${videoId}/thumbnails/custom-${Date.now()}.jpg`;
    const url = await s3Service.uploadFromPath(key, resized);

    video.thumbnails.forEach((t) => (t.isSelected = false));
    video.thumbnails.push({ url, isAuto: false, isSelected: true });
    await video.save();

    return { url };
  }

  async getProgress(sessionId: string) {
    const redis = getRedis();
    const progress = await redis.get(redisKeys.uploadProgress(sessionId));
    const sessionData = await redis.get(redisKeys.uploadSession(sessionId));
    if (!sessionData) throw new NotFoundError('Session not found');
    const session: UploadSession = JSON.parse(sessionData);
    return {
      progress: parseInt(progress || '0', 10),
      status: session.status,
      videoId: session.videoId,
    };
  }
}

export const uploadService = new UploadService();
