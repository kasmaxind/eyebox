import { Router } from 'express';
import { body } from 'express-validator';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadLimiter } from '../middleware/rateLimit';
import { chunkUpload, thumbnailUpload } from '../middleware/upload';

const router = Router();

router.post(
  '/init',
  authenticate,
  uploadLimiter,
  validate([
    body('channelId').notEmpty(),
    body('filename').notEmpty(),
    body('totalSize').isInt({ min: 1 }),
    body('totalChunks').isInt({ min: 1 }),
  ]),
  uploadController.init
);

router.post('/chunk', authenticate, uploadLimiter, chunkUpload.single('chunk'), uploadController.chunk);
router.post(
  '/complete',
  authenticate,
  validate([body('sessionId').notEmpty()]),
  uploadController.complete
);
router.post(
  '/thumbnail/:videoId',
  authenticate,
  thumbnailUpload.single('thumbnail'),
  uploadController.thumbnail
);
router.get('/progress/:sessionId', authenticate, uploadController.progress);

export default router;
