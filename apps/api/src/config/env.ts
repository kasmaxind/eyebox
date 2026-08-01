import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/** Parse "true"/"false" strings correctly (Boolean("false") === true). */
const boolFromEnv = z
  .union([z.boolean(), z.string(), z.number()])
  .transform((v) => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    const s = String(v).trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('EYEBOX TUBE.AI'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4000'),
  API_PORT: z.coerce.number().default(4000),

  MONGODB_URI: z.string().min(1),

  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  JWT_ISSUER: z.string().default('eyebox-tube-ai'),

  COOKIE_SECURE: boolFromEnv.default(false),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().default('localhost'),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().optional().default('http://localhost:4000/api/v1/auth/google/callback'),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('EYEBOX TUBE.AI <noreply@eyebox.ai>'),

  OTP_EXPIRES_MINUTES: z.coerce.number().default(10),
  OTP_LENGTH: z.coerce.number().default(6),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  S3_BUCKET: z.string().default('eyebox-media'),
  S3_ENDPOINT: z.string().optional().default(''),
  CLOUDFRONT_URL: z.string().optional().default(''),
  USE_LOCAL_STORAGE: boolFromEnv.default(true),
  LOCAL_UPLOAD_DIR: z.string().default('./uploads'),

  FFMPEG_PATH: z.string().default('ffmpeg'),
  FFPROBE_PATH: z.string().default('ffprobe'),
  VIDEO_QUALITIES: z.string().default('360,480,720,1080,1440,2160'),
  THUMBNAIL_COUNT: z.coerce.number().default(3),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  CSRF_SECRET: z.string().min(32),

  SOCKET_CORS_ORIGIN: z.string().default('http://localhost:3000'),

  OPENAI_API_KEY: z.string().optional().default(''),
  AI_PROVIDER: z.enum(['heuristic', 'openai']).default('heuristic'),

  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  PREMIUM_PRICE_MONTHLY: z.coerce.number().default(9.99),
  PREMIUM_PRICE_YEARLY: z.coerce.number().default(99.99),

  ADMIN_EMAIL: z.string().email().default('admin@eyebox.ai'),
  ADMIN_PASSWORD: z.string().default('Admin@Eyebox2026!'),
  ADMIN_NAME: z.string().default('Eyebox Admin'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_AUDIT_LOGS: boolFromEnv.default(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

export const videoQualities = env.VIDEO_QUALITIES.split(',').map((q) => parseInt(q.trim(), 10));
