import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/home', optionalAuth, recommendationController.home);
router.get('/personalized', authenticate, recommendationController.personalized);

export default router;
