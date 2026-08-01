import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { Category } from '../models/Category';
import { getRedis, redisKeys } from '../config/redis';
import { aiService } from './ai.service';

interface SearchResult {
  videos: unknown[];
  channels: unknown[];
  categories: unknown[];
}

export class SearchService {
  async search(query: string, type?: string, limit = 20) {
    const redis = getRedis();
    const cacheKey = redisKeys.searchCache(`${query}:${type || 'all'}:${limit}`);
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as SearchResult;

    const result: SearchResult = { videos: [], channels: [], categories: [] };

    if (!type || type === 'video' || type === 'all') {
      const videos = await Video.find({
        $text: { $search: query },
        status: 'ready',
        visibility: 'public',
        deletedAt: null,
      })
        .limit(limit * 2)
        .populate('channel', 'name handle logo verified');

      const alsoByTag = await Video.find({
        tags: { $regex: query, $options: 'i' },
        status: 'ready',
        visibility: 'public',
        deletedAt: null,
      })
        .limit(limit)
        .populate('channel', 'name handle logo verified');

      const combined = [...videos, ...alsoByTag];
      const seen = new Set<string>();
      const unique = combined.filter((v) => {
        const id = v._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      result.videos = await aiService.rankSearchResults(unique, query);
      result.videos = result.videos.slice(0, limit);
    }

    if (!type || type === 'channel' || type === 'all') {
      result.channels = await Channel.find({
        $text: { $search: query },
      })
        .limit(limit)
        .select('name handle logo verified subscriberCount videoCount description');
    }

    if (!type || type === 'category' || type === 'all') {
      result.categories = await Category.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
        active: true,
      }).limit(limit);
    }

    await redis.setex(cacheKey, 300, JSON.stringify(result));
    return result;
  }

  async getSuggestions(query: string, limit = 5) {
    if (!query || query.length < 2) return [];

    const videos = await Video.find({
      title: { $regex: query, $options: 'i' },
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    })
      .limit(limit)
      .select('title slug');

    const channels = await Channel.find({
      name: { $regex: query, $options: 'i' },
    })
      .limit(limit)
      .select('name handle');

    return {
      videos: videos.map((v) => ({ title: v.title, slug: v.slug, type: 'video' })),
      channels: channels.map((c) => ({ name: c.name, handle: c.handle, type: 'channel' })),
    };
  }
}

export const searchService = new SearchService();
