import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.resolve(rootDir, '.env') });

const configured = process.env.DATA_DIR || './data';
const dataDir = path.isAbsolute(configured)
  ? configured
  : path.resolve(rootDir, configured);

export const env = {
  port: Number(process.env.PORT || 4000),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production-32c',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-32',
  accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTtl: process.env.REFRESH_TOKEN_TTL || '30d',
  dataDir,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 2048),
  rootDir,
};
