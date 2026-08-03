import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { env } from './config.js';
import { fail } from './utils/response.js';

import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import playlistRoutes from './routes/playlists.js';
import notificationRoutes from './routes/notifications.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin: env.corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/', rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 30 }), authRoutes);
  app.use('/api/videos', videoRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/playlists', playlistRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use('/media/thumbs', express.static(path.join(env.dataDir, 'thumbs'), { maxAge: '1d' }));
  app.use('/media/avatars', express.static(path.join(env.dataDir, 'avatars'), { maxAge: '1d' }));
  app.use('/media/hls', express.static(path.join(env.dataDir, 'hls'), { maxAge: '1h' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'EyeBox',
        status: 'ok',
        features: [
          'auth',
          'e2e-encryption',
          'range-streaming',
          'comments',
          'subscriptions',
          'playlists',
          'notifications',
        ],
        time: new Date().toISOString(),
      },
    });
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    if (err instanceof multer.MulterError) {
      return fail(res, 400, err.message);
    }
    return fail(res, err.status || 500, err.message || 'Server error');
  });

  return app;
}

export default createApp;
