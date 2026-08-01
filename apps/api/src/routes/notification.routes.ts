import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, notificationController.list);
router.get('/unread-count', authenticate, notificationController.unreadCount);
router.put('/:id/read', authenticate, notificationController.markRead);
router.put('/read-all', authenticate, notificationController.markAllRead);
router.delete('/:id', authenticate, notificationController.delete);

export default router;
