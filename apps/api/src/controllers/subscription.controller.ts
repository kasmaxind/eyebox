import { Request, Response, NextFunction } from 'express';
import { Subscription } from '../models/Subscription';
import { Channel } from '../models/Channel';
import { NotFoundError, ConflictError } from '../utils/errors';

export class SubscriptionController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const total = await Subscription.countDocuments({ subscriber: req.user!.id });
      const subs = await Subscription.find({ subscriber: req.user!.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('channel', 'name handle logo verified subscriberCount videoCount');

      res.json({ success: true, data: subs, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await Channel.findById(req.params.channelId);
      if (!channel) throw new NotFoundError('Channel not found');

      const existing = await Subscription.findOne({
        subscriber: req.user!.id,
        channel: req.params.channelId,
      });
      if (existing) throw new ConflictError('Already subscribed');

      const sub = await Subscription.create({
        subscriber: req.user!.id,
        channel: req.params.channelId,
        notifications: req.body.notifications ?? true,
      });

      await Channel.updateOne({ _id: req.params.channelId }, { $inc: { subscriberCount: 1 } });
      res.status(201).json({ success: true, data: sub, message: 'Subscribed' });
    } catch (error) {
      next(error);
    }
  }

  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await Subscription.deleteOne({
        subscriber: req.user!.id,
        channel: req.params.channelId,
      });
      if (result.deletedCount === 0) throw new NotFoundError('Subscription not found');

      await Channel.updateOne({ _id: req.params.channelId }, { $inc: { subscriberCount: -1 } });
      res.json({ success: true, message: 'Unsubscribed' });
    } catch (error) {
      next(error);
    }
  }

  async updateNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await Subscription.findOneAndUpdate(
        { subscriber: req.user!.id, channel: req.params.channelId },
        { notifications: req.body.notifications },
        { new: true }
      );
      if (!sub) throw new NotFoundError('Subscription not found');
      res.json({ success: true, data: sub });
    } catch (error) {
      next(error);
    }
  }

  async check(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await Subscription.findOne({
        subscriber: req.user!.id,
        channel: req.params.channelId,
      });
      res.json({ success: true, data: { subscribed: !!sub, notifications: sub?.notifications } });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
