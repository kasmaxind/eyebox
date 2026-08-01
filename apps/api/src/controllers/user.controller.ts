import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { History } from '../models/History';
import { WatchLater } from '../models/WatchLater';
import { NotFoundError } from '../utils/errors';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id).select('name avatar role createdAt');
      if (!user) throw new NotFoundError('User not found');
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const allowed = ['name', 'avatar', 'preferences'];
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
      const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true })
        .select('-passwordHash -devices -otp');
      res.json({ success: true, data: user, message: 'Profile updated' });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const total = await History.countDocuments({ user: req.user!.id });
      const history = await History.find({ user: req.user!.id })
        .sort({ lastWatchedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'video', populate: { path: 'channel', select: 'name handle logo' } });

      res.json({ success: true, data: history, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  async updateHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await History.findOneAndUpdate(
        { user: req.user!.id, video: req.body.videoId },
        {
          watchedSeconds: req.body.watchedSeconds,
          progress: req.body.progress,
          completed: req.body.completed,
          lastWatchedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getWatchLater(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await WatchLater.find({ user: req.user!.id })
        .sort({ addedAt: -1 })
        .populate({ path: 'video', populate: { path: 'channel', select: 'name handle logo' } });
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async addWatchLater(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await WatchLater.findOneAndUpdate(
        { user: req.user!.id, video: req.body.videoId },
        { addedAt: new Date() },
        { upsert: true, new: true }
      );
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async removeWatchLater(req: Request, res: Response, next: NextFunction) {
    try {
      await WatchLater.deleteOne({ user: req.user!.id, video: req.params.videoId });
      res.json({ success: true, message: 'Removed from watch later' });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
