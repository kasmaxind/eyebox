import dayjs from 'dayjs';
import { Analytics } from '../models/Analytics';
import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { History } from '../models/History';
import { Types } from 'mongoose';

export class AnalyticsService {
  async recordView(videoId: string, watchSeconds = 0, country?: string, device?: string) {
    const video = await Video.findById(videoId);
    if (!video) return;

    const today = dayjs().startOf('day').toDate();

    await Analytics.findOneAndUpdate(
      { entityType: 'video', entityId: videoId, date: today },
      {
        $inc: { views: 1, watchTime: watchSeconds },
        $setOnInsert: { entityType: 'video', entityId: videoId, date: today },
      },
      { upsert: true }
    );

    if (country) {
      await Analytics.updateOne(
        { entityType: 'video', entityId: videoId, date: today },
        { $push: { countries: { country, views: 1, watchTime: watchSeconds } } }
      );
    }

    await Analytics.findOneAndUpdate(
      { entityType: 'channel', entityId: video.channel, date: today },
      {
        $inc: { views: 1, watchTime: watchSeconds },
        $setOnInsert: { entityType: 'channel', entityId: video.channel, date: today },
      },
      { upsert: true }
    );
  }

  async getVideoAnalytics(videoId: string, days = 30) {
    const startDate = dayjs().subtract(days, 'day').startOf('day').toDate();
    const data = await Analytics.find({
      entityType: 'video',
      entityId: videoId,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const totals = {
      views: data.reduce((s, d) => s + d.views, 0),
      watchTime: data.reduce((s, d) => s + d.watchTime, 0),
      revenue: data.reduce((s, d) => s + d.revenue, 0),
    };

    return { daily: data, totals };
  }

  async getChannelAnalytics(channelId: string, days = 30) {
    const startDate = dayjs().subtract(days, 'day').startOf('day').toDate();
    const data = await Analytics.find({
      entityType: 'channel',
      entityId: channelId,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const channel = await Channel.findById(channelId);
    const videoCount = await Video.countDocuments({ channel: channelId, deletedAt: null });

    const totals = {
      views: data.reduce((s, d) => s + d.views, 0),
      watchTime: data.reduce((s, d) => s + d.watchTime, 0),
      subscribers: channel?.subscriberCount || 0,
      videoCount,
      revenue: data.reduce((s, d) => s + d.revenue, 0),
    };

    return { daily: data, totals };
  }

  async getDashboardStats() {
    const totalVideos = await Video.countDocuments({ deletedAt: null });
    const totalChannels = await Channel.countDocuments();
    const totalViews = await Video.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const recentHistory = await History.countDocuments({
      lastWatchedAt: { $gte: dayjs().subtract(24, 'hour').toDate() },
    });

    return {
      totalVideos,
      totalChannels,
      totalViews: totalViews[0]?.total || 0,
      activeViewers24h: recentHistory,
    };
  }
}

export const analyticsService = new AnalyticsService();
