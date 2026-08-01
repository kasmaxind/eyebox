import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '../types';

const roleHierarchy: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  creator: 2,
  moderator: 3,
  admin: 4,
};

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    const userRole = req.user.role as UserRole;
    if (!roles.includes(userRole)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}

export function requireMinRole(minRole: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    const userRole = req.user.role as UserRole;
    if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}

export const requireAdmin = requireMinRole('admin');
export const requireModerator = requireMinRole('moderator');
export const requireCreator = requireMinRole('creator');
