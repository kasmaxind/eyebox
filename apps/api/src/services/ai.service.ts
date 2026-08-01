import { Types } from 'mongoose';
import { Video, IVideo } from '../models/Video';
import { History } from '../models/History';
import { Like } from '../models/Like';
import { Subscription } from '../models/Subscription';
import { Category } from '../models/Category';

export class AiService {
  generateSummary(title: string, description?: string, tags: string[] = []): string {
    const parts = [title];
    if (description) parts.push(description.slice(0, 200));
    if (tags.length) parts.push(`Topics: ${tags.join(', ')}`);
    const combined = parts.join('. ');
    return combined.length > 300 ? combined.slice(0, 297) + '...' : combined;
  }

  generateChapters(duration: number, title: string): { title: string; start: number; end: number }[] {
    if (duration <= 0) return [];
    const chapterCount = Math.min(Math.floor(duration / 120), 10);
    if (chapterCount < 2) return [];

    const chapters: { title: string; start: number; end: number }[] = [];
    const segmentLength = duration / chapterCount;

    for (let i = 0; i < chapterCount; i++) {
      chapters.push({
        title: i === 0 ? 'Introduction' : i === chapterCount - 1 ? 'Conclusion' : `Part ${i + 1}`,
        start: Math.floor(i * segmentLength),
        end: Math.floor((i + 1) * segmentLength),
      });
    }
    return chapters;
  }

  scoreThumbnail(thumbnails: string[], title: string): number {
    if (!thumbnails.length) return 0;
    const hash = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return hash % thumbnails.length;
  }

  detectSpam(text: string): number {
    const lower = text.toLowerCase();
    let score = 0;
    const spamPatterns = [
      /(.)\1{4,}/,
      /(https?:\/\/[^\s]+){2,}/,
      /\b(free|click here|subscribe now|buy now|make money|crypto giveaway)\b/i,
      /[A-Z]{5,}/,
      /\b(free\s+){2,}/i,
    ];
    for (const pattern of spamPatterns) {
      if (pattern.test(text) || pattern.test(lower)) score += 0.25;
    }
    if (text.length < 3) score += 0.3;
    if (text.split(/\s+/).length > 50) score += 0.2;
    const urlCount = (text.match(/https?:\/\//gi) || []).length;
    if (urlCount >= 1) score += 0.15;
    return Math.min(score, 1);
  }

  classifyContent(tags: string[], categoryName?: string): string {
    const tagStr = tags.join(' ').toLowerCase();
    const categories: Record<string, string[]> = {
      gaming: ['game', 'gaming', 'esports', 'playthrough'],
      music: ['music', 'song', 'album', 'concert'],
      education: ['learn', 'tutorial', 'course', 'how to'],
      tech: ['tech', 'software', 'coding', 'programming'],
      comedy: ['funny', 'comedy', 'meme', 'humor'],
    };

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((k) => tagStr.includes(k))) return cat;
    }
    return categoryName?.toLowerCase() || 'entertainment';
  }

  predictTrendVelocity(views: number, publishedAt?: Date): number {
    if (!publishedAt) return 0;
    const hoursSincePublish = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSincePublish < 1) return views * 24;
    return views / hoursSincePublish;
  }

  async rankSearchResults(videos: IVideo[], query: string): Promise<IVideo[]> {
    const q = query.toLowerCase();
    return videos
      .map((v) => {
        let score = 0;
        if (v.title.toLowerCase().includes(q)) score += 10;
        if (v.description?.toLowerCase().includes(q)) score += 5;
        if (v.tags.some((t) => t.toLowerCase().includes(q))) score += 3;
        score += Math.log10(v.views + 1);
        score += this.predictTrendVelocity(v.views, v.publishedAt) * 0.1;
        return { video: v, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((r) => r.video);
  }

  async getCollaborativeRecommendations(userId: string, limit = 20): Promise<Types.ObjectId[]> {
    const likedVideos = await Like.find({ user: userId, targetType: 'video', value: 'like' })
      .limit(50)
      .select('targetId');
    const likedIds = likedVideos.map((l) => l.targetId);

    if (likedIds.length === 0) return [];

    const similarUsers = await Like.find({
      targetType: 'video',
      value: 'like',
      targetId: { $in: likedIds },
      user: { $ne: userId },
    })
      .limit(100)
      .select('user targetId');

    const userScores = new Map<string, number>();
    for (const like of similarUsers) {
      const uid = like.user.toString();
      userScores.set(uid, (userScores.get(uid) || 0) + 1);
    }

    const topSimilarUsers = [...userScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([uid]) => uid);

    const recommendations = await Like.find({
      user: { $in: topSimilarUsers },
      targetType: 'video',
      value: 'like',
      targetId: { $nin: likedIds },
    })
      .limit(limit * 2)
      .select('targetId');

    const seen = new Set<string>();
    const result: Types.ObjectId[] = [];
    for (const r of recommendations) {
      const id = r.targetId.toString();
      if (!seen.has(id)) {
        seen.add(id);
        result.push(r.targetId);
        if (result.length >= limit) break;
      }
    }
    return result;
  }

  async getContentBasedRecommendations(tags: string[], categoryId?: string, limit = 20): Promise<Types.ObjectId[]> {
    const query: Record<string, unknown> = {
      status: 'ready',
      visibility: 'public',
      deletedAt: null,
    };
    if (tags.length) query.tags = { $in: tags };
    if (categoryId) query.category = categoryId;

    const videos = await Video.find(query)
      .sort({ views: -1 })
      .limit(limit)
      .select('_id');
    return videos.map((v) => v._id);
  }
}

export const aiService = new AiService();
