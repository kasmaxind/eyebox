import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRedis, redisKeys } from '../config/redis';
import { env } from '../config/env';
import { ForbiddenError } from '../utils/errors';

const CSRF_TTL = 3600;

export async function generateCsrfToken(_req: Request, res: Response): Promise<void> {
  const token = uuidv4();
  const redis = getRedis();
  await redis.setex(redisKeys.csrfToken(token), CSRF_TTL, '1');

  res.json({
    success: true,
    data: { csrfToken: token },
    message: 'CSRF token generated',
  });
}

export async function validateCsrf(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const token = req.headers['x-csrf-token'] as string;
  if (!token) {
    next(new ForbiddenError('CSRF token missing'));
    return;
  }

  const redis = getRedis();
  const exists = await redis.get(redisKeys.csrfToken(token));
  if (!exists) {
    next(new ForbiddenError('Invalid or expired CSRF token'));
    return;
  }

  req.csrfToken = token;
  next();
}

export const csrfConfig = {
  secret: env.CSRF_SECRET,
  ttl: CSRF_TTL,
};
