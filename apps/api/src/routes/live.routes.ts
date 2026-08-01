import { Router } from 'express';
import { liveController } from '../controllers/live.controller';
import { authenticate } from '../middleware/auth';
import { sanitizeBody } from '../middleware/validate';

const router = Router();

router.get('/', liveController.list);
router.post('/', authenticate, sanitizeBody, liveController.create);
router.get('/:id', liveController.getById);
router.post('/:id/end', authenticate, liveController.end);
router.put('/:id/viewers', liveController.updateViewers);

export default router;
