import { Router } from 'express';
import { body, param } from 'express-validator';
import { videoController } from '../controllers/video.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, sanitizeBody } from '../middleware/validate';

const router = Router();

router.get('/feed', optionalAuth, videoController.feed);
router.get('/trending', videoController.trending);
router.get('/shorts', videoController.shorts);
router.get('/live', videoController.live);

router.post(
  '/',
  authenticate,
  sanitizeBody,
  validate([
    body('channelId').notEmpty(),
    body('title').trim().isLength({ min: 1, max: 200 }),
  ]),
  videoController.create
);

router.get('/:id', optionalAuth, videoController.getById);
router.put('/:id', authenticate, sanitizeBody, videoController.update);
router.post('/:id/publish', authenticate, videoController.publish);
router.delete('/:id', authenticate, videoController.delete);
router.post(
  '/:id/like',
  authenticate,
  validate([body('value').isIn(['like', 'dislike'])]),
  videoController.likeDislike
);
router.post('/:id/report', authenticate, videoController.report);
router.get('/:id/related', videoController.related);

export default router;
