import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, subscriptionController.list);
router.post('/:channelId', authenticate, subscriptionController.subscribe);
router.delete('/:channelId', authenticate, subscriptionController.unsubscribe);
router.put('/:channelId/notifications', authenticate, subscriptionController.updateNotifications);
router.get('/:channelId/check', authenticate, subscriptionController.check);

export default router;
