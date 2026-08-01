import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { sanitizeBody } from '../middleware/validate';

const router = Router();

router.get('/:id', userController.getProfile);
router.put('/profile', authenticate, sanitizeBody, userController.updateProfile);
router.get('/history', authenticate, userController.getHistory);
router.post('/history', authenticate, userController.updateHistory);
router.get('/watch-later', authenticate, userController.getWatchLater);
router.post('/watch-later', authenticate, userController.addWatchLater);
router.delete('/watch-later/:videoId', authenticate, userController.removeWatchLater);

export default router;
