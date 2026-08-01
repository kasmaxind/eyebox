import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { Report } from '../models/Report';
import { AuditLog } from '../models/AuditLog';
import { analyticsService } from '../services/analytics.service';
import { moderationService } from '../services/moderation.service';
import { NotFoundError } from '../utils/errors';
import { getParam } from '../utils/params';

export class AdminController {
  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const query: Record<string, unknown> = {};
      if (req.query.role) query.role = req.query.role;
      if (req.query.banned) query.banned = req.query.banned === 'true';

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-passwordHash -devices.refreshTokenHash -otp')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({ success: true, data: users, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
      ).select('-passwordHash');
      if (!user) throw new NotFoundError('User not found');
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await moderationService.banUser(getParam(req, 'id'), req.body.banned);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await moderationService.getPendingReports(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );
      res.json({
        success: true,
        data: result.reports,
        meta: { page: result.page, limit: result.limit, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await moderationService.resolveReport(
        getParam(req, 'id'),
        req.user!.id,
        req.body.status,
        req.body.resolution
      );
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async moderateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await moderationService.moderateComment(
        getParam(req, 'id'),
        req.user!.id,
        req.body.action
      );
      res.json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async hideVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await moderationService.hideVideo(getParam(req, 'id'));
      res.json({ success: true, data: video });
    } catch (error) {
      next(error);
    }
  }

  async auditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const total = await AuditLog.countDocuments();
      const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actor', 'name email role');

      res.json({ success: true, data: logs, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  async verifyChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await Channel.findByIdAndUpdate(
        req.params.id,
        { verified: req.body.verified },
        { new: true }
      );
      if (!channel) throw new NotFoundError('Channel not found');
      res.json({ success: true, data: channel });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
