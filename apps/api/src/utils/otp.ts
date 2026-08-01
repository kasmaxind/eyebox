import { env } from '../config/env';
import { getRedis, redisKeys } from '../config/redis';

export function generateOtp(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < env.OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export async function storeOtp(email: string, otp: string): Promise<void> {
  const redis = getRedis();
  const ttl = env.OTP_EXPIRES_MINUTES * 60;
  await redis.setex(redisKeys.otp(email), ttl, otp);
}

export async function verifyStoredOtp(email: string, otp: string): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get(redisKeys.otp(email));
  if (!stored || stored !== otp) return false;
  await redis.del(redisKeys.otp(email));
  return true;
}
