import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { getParam } from '../utils/params';

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getForUser(
        req.user!.id,
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20,
        req.query.unread === 'true'
      );
      res.json({
        success: true,
        data: result.notifications,
        meta: { page: result.page, limit: result.limit, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markRead(req.user!.id, getParam(req, 'id'));
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllRead(req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.deleteNotification(req.user!.id, getParam(req, 'id'));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getUnreadCount(req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
