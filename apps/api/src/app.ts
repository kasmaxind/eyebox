import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import passport from 'passport';
import { env, corsOrigins } from './config/env';
import routes from './routes';
import { generalLimiter } from './middleware/rateLimit';
import { sanitizeBody } from './middleware/validate';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  }));

  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  }));

  app.use(compression());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(sanitizeBody);
  app.use(passport.initialize());
  app.use(generalLimiter);

  if (env.USE_LOCAL_STORAGE) {
    const uploadPath = path.resolve(process.cwd(), env.LOCAL_UPLOAD_DIR);
    app.use('/uploads', express.static(uploadPath));
  }

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: '@eyebox/api',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use('/api/v1', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
