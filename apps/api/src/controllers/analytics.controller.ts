import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { Channel } from '../models/Channel';
import { ForbiddenError } from '../utils/errors';
import { getParam } from '../utils/params';

export class AnalyticsController {
  async videoAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getVideoAnalytics(
        getParam(req, 'videoId'),
        parseInt(req.query.days as string) || 30
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async channelAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await Channel.findById(getParam(req, 'channelId'));
      if (!channel || channel.owner.toString() !== req.user!.id) {
        throw new ForbiddenError('Not authorized');
      }
      const data = await analyticsService.getChannelAnalytics(
        getParam(req, 'channelId'),
        parseInt(req.query.days as string) || 30
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async recordView(req: Request, res: Response, next: NextFunction) {
    try {
      await analyticsService.recordView(
        req.body.videoId,
        req.body.watchSeconds || 0,
        req.body.country,
        req.body.device
      );
      res.json({ success: true, message: 'View recorded' });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
