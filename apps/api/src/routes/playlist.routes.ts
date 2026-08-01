import { Router } from 'express';
import { body } from 'express-validator';
import { playlistController } from '../controllers/playlist.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, sanitizeBody } from '../middleware/validate';

const router = Router();

router.get('/', authenticate, playlistController.list);
router.get('/:id', optionalAuth, playlistController.getById);
router.post(
  '/',
  authenticate,
  sanitizeBody,
  validate([body('title').trim().isLength({ min: 1 })]),
  playlistController.create
);
router.put('/:id', authenticate, sanitizeBody, playlistController.update);
router.delete('/:id', authenticate, playlistController.delete);
router.post('/:id/videos', authenticate, validate([body('videoId').notEmpty()]), playlistController.addVideo);
router.delete('/:id/videos/:videoId', authenticate, playlistController.removeVideo);

export default router;
