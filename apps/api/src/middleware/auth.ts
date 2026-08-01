import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { User } from '../models/User';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('email role name banned');

    if (!user || user.banned) {
      throw new UnauthorizedError('User not found or banned');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    req.deviceId = payload.deviceId;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

    if (token) {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub).select('email role name banned');
      if (user && !user.banned) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
        };
        req.deviceId = payload.deviceId;
      }
    }
    next();
  } catch {
    next();
  }
}
