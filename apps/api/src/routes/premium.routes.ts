import { Router } from 'express';
import { premiumController } from '../controllers/premium.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/plans', premiumController.getPlans);
router.get('/status', authenticate, premiumController.getStatus);
router.post('/subscribe', authenticate, premiumController.subscribe);
router.post('/cancel', authenticate, premiumController.cancel);

export default router;
