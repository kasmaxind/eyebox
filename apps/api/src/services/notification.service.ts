import { Notification, INotification } from '../models/Notification';
import { NotificationType } from '../types';
import { NotFoundError } from '../utils/errors';

export class NotificationService {
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<INotification> {
    return Notification.create({ user: userId, type, title, body, data });
  }

  async getForUser(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const query: Record<string, unknown> = { user: userId };
    if (unreadOnly) query.read = false;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { notifications, total, page, limit };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await Notification.findOne({ _id: notificationId, user: userId });
    if (!notification) throw new NotFoundError('Notification not found');
    notification.read = true;
    await notification.save();
    return notification;
  }

  async markAllRead(userId: string) {
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    return { success: true };
  }

  async deleteNotification(userId: string, notificationId: string) {
    await Notification.deleteOne({ _id: notificationId, user: userId });
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({ user: userId, read: false });
    return { count };
  }

  async notifyNewVideo(channelId: string, channelName: string, videoTitle: string, videoId: string) {
    const { Subscription } = await import('../models/Subscription');
    const subs = await Subscription.find({ channel: channelId, notifications: true }).select('subscriber');

    for (const sub of subs) {
      await this.create(
        sub.subscriber.toString(),
        'new_video',
        `New video from ${channelName}`,
        videoTitle,
        { videoId, channelId }
      );
    }
  }
}

export const notificationService = new NotificationService();
