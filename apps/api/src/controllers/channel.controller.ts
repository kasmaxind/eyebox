import { Request, Response, NextFunction } from 'express';
import { Channel } from '../models/Channel';
import { Video } from '../models/Video';
import { Subscription } from '../models/Subscription';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class ChannelController {
  async getByHandle(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await Channel.findOne({ handle: req.params.handle })
        .populate('owner', 'name avatar');
      if (!channel) throw new NotFoundError('Channel not found');
      res.json({ success: true, data: channel });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await Channel.findById(req.params.id).populate('owner', 'name avatar');
      if (!channel) throw new NotFoundError('Channel not found');
      res.json({ success: true, data: channel });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await Channel.findById(req.params.id);
      if (!channel) throw new NotFoundError('Channel not found');
      if (channel.owner.toString() !== req.user!.id) throw new ForbiddenError('Not authorized');

      const allowed = ['name', 'description', 'banner', 'logo', 'socialLinks', 'branding', 'membershipsEnabled'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) (channel as unknown as Record<string, unknown>)[key] = req.body[key];
      }
      await channel.save();
      res.json({ success: true, data: channel, message: 'Channel updated' });
    } catch (error) {
      next(error);
    }
  }

  async getVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const query = {
        channel: req.params.id,
        deletedAt: null,
        visibility: 'public',
        status: 'ready',
      };
      const total = await Video.countDocuments(query);
      const videos = await Video.find(query)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-videoFiles');

      res.json({ success: true, data: videos, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  async getMyChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await Channel.findOne({ owner: req.user!.id });
      if (!channel) throw new NotFoundError('Channel not found');
      res.json({ success: true, data: channel });
    } catch (error) {
      next(error);
    }
  }
}

export const channelController = new ChannelController();
