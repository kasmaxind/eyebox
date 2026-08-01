import { Router } from 'express';
import { body } from 'express-validator';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate, sanitizeBody } from '../middleware/validate';

const router = Router();

router.get('/video/:videoId', commentController.list);

router.post(
  '/video/:videoId',
  authenticate,
  sanitizeBody,
  validate([body('text').trim().isLength({ min: 1, max: 5000 })]),
  commentController.create
);

router.put('/:id', authenticate, sanitizeBody, commentController.update);
router.delete('/:id', authenticate, commentController.delete);
router.post('/:id/like', authenticate, commentController.like);
router.post('/:id/pin', authenticate, commentController.pin);

export default router;
