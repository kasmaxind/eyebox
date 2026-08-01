import http from 'http';
import { Server as SocketServer } from 'socket.io';
import winston from 'winston';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initSockets } from './sockets';

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [new winston.transports.Console()],
});

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);

  const io = new SocketServer(server, {
    cors: {
      origin: env.SOCKET_CORS_ORIGIN,
      credentials: true,
    },
    path: '/socket.io',
  });

  app.set('io', io);
  initSockets(io);

  server.listen(env.API_PORT, () => {
    logger.info(`EYEBOX TUBE.AI API running on port ${env.API_PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Health: http://localhost:${env.API_PORT}/health`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    server.close();
    const { disconnectDatabase } = await import('./config/database');
    const { disconnectRedis } = await import('./config/redis');
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
