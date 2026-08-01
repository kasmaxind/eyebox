import { Router } from 'express';
import { channelController } from '../controllers/channel.controller';
import { authenticate } from '../middleware/auth';
import { sanitizeBody } from '../middleware/validate';

const router = Router();

router.get('/me', authenticate, channelController.getMyChannel);
router.get('/handle/:handle', channelController.getByHandle);
router.get('/:id', channelController.getById);
router.put('/:id', authenticate, sanitizeBody, channelController.update);
router.get('/:id/videos', channelController.getVideos);

export default router;
