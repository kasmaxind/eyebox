import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { env } from '../config/env';

export function auditLog(action: string, targetType?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!env.ENABLE_AUDIT_LOGS || !req.user) {
      next();
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      if (res.statusCode < 400) {
        AuditLog.create({
          actor: req.user!.id,
          action,
          targetType,
          targetId: req.params.id || req.params.userId,
          details: { body: req.body, params: req.params },
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}
