import { Types } from 'mongoose';
import { Video, IVideo } from '../models/Video';
import { Channel } from '../models/Channel';
import { Like } from '../models/Like';
import { Report } from '../models/Report';
import { History } from '../models/History';
import { createSlug } from '../utils/slug';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { aiService } from './ai.service';

interface CreateVideoInput {
  channelId: string;
  uploaderId: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  language?: string;
  visibility?: string;
  isShort?: boolean;
}

interface FeedOptions {
  cursor?: string;
  limit?: number;
  category?: string;
  channelId?: string;
}

export class VideoService {
  async create(input: CreateVideoInput): Promise<IVideo> {
    const slug = createSlug(input.title);
    const video = await Video.create({
      channel: input.channelId,
      uploader: input.uploaderId,
      title: input.title,
      description: input.description,
      slug,
      tags: input.tags || [],
      category: input.category,
      language: input.language || 'en',
      visibility: input.visibility || 'private',
      isShort: input.isShort || false,
      status: 'uploading',
    });
    return video;
  }

  async getById(id: string, userId?: string, incrementView = false): Promise<IVideo> {
    const video = await Video.findOne({ _id: id, deletedAt: null })
      .populate('channel', 'name handle logo verified subscriberCount')
      .populate('uploader', 'name avatar')
      .populate('category', 'name slug');

    if (!video) throw new NotFoundError('Video not found');

    if (incrementView) {
      await Video.updateOne({ _id: id }, { $inc: { views: 1 } });
      video.views += 1;

      if (userId) {
        await History.findOneAndUpdate(
          { user: userId, video: id },
          { lastWatchedAt: new Date(), $inc: { watchedSeconds: 1 } },
          { upsert: true }
        );
      }
    }

    return video;
  }

  async update(id: string, userId: string, data: Partial<CreateVideoInput>): Promise<IVideo> {
    const video = await Video.findOne({ _id: id, deletedAt: null });
    if (!video) throw new NotFoundError('Video not found');

    const channel = await Channel.findById(video.channel);
    if (!channel || channel.owner.toString() !== userId) {
      throw new ForbiddenError('Not authorized to update this video');
    }

    const updates: Record<string, unknown> = {};
    if (data.title) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.tags) updates.tags = data.tags;
    if (data.category) updates.category = data.category;
    if (data.language) updates.language = data.language;
    if (data.visibility) updates.visibility = data.visibility;
    if (data.isShort !== undefined) updates.isShort = data.isShort;

    const updated = await Video.findByIdAndUpdate(id, updates, { new: true });
    return updated!;
  }

  async publish(id: string, userId: string): Promise<IVideo> {
    const video = await Video.findOne({ _id: id, deletedAt: null });
    if (!video) throw new NotFoundError('Video not found');

    const channel = await Channel.findById(video.channel);
    if (!channel || channel.owner.toString() !== userId) {
      throw new ForbiddenError('Not authorized');
    }

    if (video.status !== 'ready') throw new ForbiddenError('Video is not ready for publishing');

    video.visibility = 'public';
    video.publishedAt = new Date();
    await video.save();

    await Channel.updateOne({ _id: video.channel }, { $inc: { videoCount: 1 } });
    return video;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const video = await Video.findOne({ _id: id, deletedAt: null });
    if (!video) throw new NotFoundError('Video not found');

    const channel = await Channel.findById(video.channel);
    if (!channel || channel.owner.toString() !== userId) {
      throw new ForbiddenError('Not authorized');
    }

    await Video.updateOne({ _id: id }, { deletedAt: new Date(), visibility: 'private' });
    if (video.visibility === 'public') {
      await Channel.updateOne({ _id: video.channel }, { $inc: { videoCount: -1 } });
    }
  }

  async getFeed(options: FeedOptions = {}) {
    const limit = Math.min(options.limit || 20, 50);
    const query: Record<string, unknown> = {
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    };

    if (options.category) query.category = options.category;
    if (options.channelId) query.channel = options.channelId;
    if (options.cursor) query._id = { $lt: new Types.ObjectId(options.cursor) };

    const videos = await Video.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit + 1)
      .populate('channel', 'name handle logo verified')
      .populate('uploader', 'name avatar')
      .select('-videoFiles');

    const hasMore = videos.length > limit;
    const items = hasMore ? videos.slice(0, limit) : videos;
    const nextCursor = hasMore ? items[items.length - 1]._id.toString() : null;

    return { videos: items, nextCursor, limit };
  }

  async getTrending(limit = 20) {
    const videos = await Video.find({
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
      publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ views: -1 })
      .limit(limit)
      .populate('channel', 'name handle logo verified');

    const ranked = await aiService.rankSearchResults(videos, '');
    return ranked;
  }

  async getShorts(limit = 20, cursor?: string) {
    const query: Record<string, unknown> = {
      isShort: true,
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    };
    if (cursor) query._id = { $lt: new Types.ObjectId(cursor) };

    const videos = await Video.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit + 1)
      .populate('channel', 'name handle logo');

    const hasMore = videos.length > limit;
    const items = hasMore ? videos.slice(0, limit) : videos;
    return {
      videos: items,
      nextCursor: hasMore ? items[items.length - 1]._id.toString() : null,
    };
  }

  async getLive(limit = 20) {
    return Video.find({
      isLive: true,
      status: 'live',
      deletedAt: null,
    })
      .sort({ views: -1 })
      .limit(limit)
      .populate('channel', 'name handle logo verified');
  }

  async likeDislike(userId: string, videoId: string, value: 'like' | 'dislike') {
    const video = await Video.findOne({ _id: videoId, deletedAt: null });
    if (!video) throw new NotFoundError('Video not found');

    const existing = await Like.findOne({ user: userId, targetType: 'video', targetId: videoId });

    if (existing) {
      if (existing.value === value) {
        await Like.deleteOne({ _id: existing._id });
        const inc = value === 'like' ? { likes: -1 } : { dislikes: -1 };
        await Video.updateOne({ _id: videoId }, { $inc: inc });
        return { action: 'removed', value };
      }
      const prevInc = existing.value === 'like' ? { likes: -1, dislikes: 1 } : { likes: 1, dislikes: -1 };
      existing.value = value;
      await existing.save();
      await Video.updateOne({ _id: videoId }, { $inc: prevInc });
      return { action: 'changed', value };
    }

    await Like.create({ user: userId, targetType: 'video', targetId: videoId, value });
    const inc = value === 'like' ? { likes: 1 } : { dislikes: 1 };
    await Video.updateOne({ _id: videoId }, { $inc: inc });
    return { action: 'added', value };
  }

  async reportVideo(reporterId: string, videoId: string, reason: string, details?: string) {
    const video = await Video.findById(videoId);
    if (!video) throw new NotFoundError('Video not found');

    return Report.create({
      reporter: reporterId,
      targetType: 'video',
      targetId: videoId,
      reason,
      details,
    });
  }

  async getRelated(videoId: string, limit = 10) {
    const video = await Video.findById(videoId);
    if (!video) throw new NotFoundError('Video not found');

    const related = await Video.find({
      _id: { $ne: videoId },
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
      $or: [
        { tags: { $in: video.tags } },
        { category: video.category },
        { channel: video.channel },
      ],
    })
      .sort({ views: -1 })
      .limit(limit)
      .populate('channel', 'name handle logo');

    return related;
  }
}

export const videoService = new VideoService();
