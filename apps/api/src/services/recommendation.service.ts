import { Types } from 'mongoose';
import { Video } from '../models/Video';
import { History } from '../models/History';
import { Subscription } from '../models/Subscription';
import { Like } from '../models/Like';
import { aiService } from './ai.service';

export class RecommendationService {
  async getPersonalizedFeed(userId: string, limit = 20, cursor?: string) {
    const history = await History.find({ user: userId })
      .sort({ lastWatchedAt: -1 })
      .limit(20)
      .populate('video', 'tags category');

    const watchedTags: string[] = [];
    const watchedCategories: string[] = [];
    for (const h of history) {
      const v = h.video as { tags?: string[]; category?: Types.ObjectId };
      if (v?.tags) watchedTags.push(...v.tags);
      if (v?.category) watchedCategories.push(v.category.toString());
    }

    const collaborative = await aiService.getCollaborativeRecommendations(userId, limit);
    const contentBased = await aiService.getContentBasedRecommendations(
      watchedTags.slice(0, 10),
      watchedCategories[0],
      limit
    );

    const subscribed = await Subscription.find({ subscriber: userId }).select('channel');
    const subChannelIds = subscribed.map((s) => s.channel);

    const subscriptionVideos = await Video.find({
      channel: { $in: subChannelIds },
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('_id');

    const allIds = new Set<string>();
    const orderedIds: Types.ObjectId[] = [];

    for (const id of [...subscriptionVideos.map((v) => v._id), ...collaborative, ...contentBased]) {
      const str = id.toString();
      if (!allIds.has(str)) {
        allIds.add(str);
        orderedIds.push(id);
      }
    }

    const query: Record<string, unknown> = {
      _id: { $in: orderedIds },
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    };
    if (cursor) query._id = { $lt: new Types.ObjectId(cursor), $in: orderedIds };

    const videos = await Video.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit + 1)
      .populate('channel', 'name handle logo verified')
      .populate('uploader', 'name avatar');

    const hasMore = videos.length > limit;
    const items = hasMore ? videos.slice(0, limit) : videos;
    return {
      videos: items,
      nextCursor: hasMore ? items[items.length - 1]._id.toString() : null,
    };
  }

  async getHomeSections(userId?: string) {
    const trending = await Video.find({
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    })
      .sort({ views: -1 })
      .limit(10)
      .populate('channel', 'name handle logo');

    const recent = await Video.find({
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .populate('channel', 'name handle logo');

    const shorts = await Video.find({
      isShort: true,
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .populate('channel', 'name handle logo');

    let recommended = recent;
    if (userId) {
      const feed = await this.getPersonalizedFeed(userId, 10);
      recommended = feed.videos;
    }

    return {
      sections: [
        { id: 'recommended', title: 'Recommended for you', videos: recommended },
        { id: 'trending', title: 'Trending', videos: trending },
        { id: 'recent', title: 'Recently uploaded', videos: recent },
        { id: 'shorts', title: 'Shorts', videos: shorts },
      ],
    };
  }
}

export const recommendationService = new RecommendationService();
