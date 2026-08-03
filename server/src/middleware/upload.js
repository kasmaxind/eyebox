import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { env } from '../config.js';

function storage(subdir, preserveExt = true) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(env.dataDir, subdir)),
    filename: (_req, file, cb) => {
      const ext = preserveExt ? path.extname(file.originalname).toLowerCase() || '.bin' : '.bin';
      cb(null, `${nanoid(18)}${ext}`);
    },
  });
}

export const videoUpload = multer({
  storage: storage('videos'),
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('video/') && file.mimetype !== 'application/octet-stream') {
      return cb(new Error('Only video files allowed'));
    }
    cb(null, true);
  },
});

export const encryptedUpload = multer({
  storage: storage('encrypted', false),
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
});

export const imageUpload = multer({
  storage: storage('avatars'),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  },
});

export const thumbUpload = multer({
  storage: storage('thumbs'),
  limits: { fileSize: 8 * 1024 * 1024 },
});
