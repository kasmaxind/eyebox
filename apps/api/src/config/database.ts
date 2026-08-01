import mongoose from 'mongoose';
import { env } from './env';
import winston from 'winston';

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [new winston.transports.Console()],
});

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
