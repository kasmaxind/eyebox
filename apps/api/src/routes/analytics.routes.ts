import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/view', analyticsController.recordView);
router.get('/video/:videoId', authenticate, analyticsController.videoAnalytics);
router.get('/channel/:channelId', authenticate, analyticsController.channelAnalytics);

export default router;
