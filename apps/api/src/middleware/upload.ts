import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.resolve(process.cwd(), env.LOCAL_UPLOAD_DIR, 'temp');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

export const chunkUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const sessionId = _req.body?.sessionId || _req.query?.sessionId;
      const dir = path.join(uploadDir, sessionId as string || 'default');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, _file, cb) => {
      const chunkIndex = _req.body?.chunkIndex ?? _req.query?.chunkIndex ?? '0';
      cb(null, `chunk-${chunkIndex}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const thumbnailUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed for thumbnails'));
  },
});
