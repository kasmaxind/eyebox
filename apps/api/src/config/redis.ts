import Redis from 'ioredis';
import { env } from './env';
import winston from 'winston';

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [new winston.transports.Console()],
});

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    redis.on('error', (err) => logger.error('Redis error', { err }));
    redis.on('connect', () => logger.info('Redis connected'));
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  await client.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export const redisKeys = {
  uploadSession: (id: string) => `upload:session:${id}`,
  uploadProgress: (id: string) => `upload:progress:${id}`,
  csrfToken: (token: string) => `csrf:${token}`,
  otp: (email: string) => `otp:${email}`,
  rateLimit: (key: string) => `rl:${key}`,
  trending: () => 'trending:videos',
  searchCache: (q: string) => `search:${q}`,
};
