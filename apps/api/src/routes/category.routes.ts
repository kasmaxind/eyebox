import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import { sanitizeBody } from '../middleware/validate';

const router = Router();

router.get('/', categoryController.list);
router.get('/:id', categoryController.getById);
router.post('/', authenticate, requireAdmin, sanitizeBody, categoryController.create);
router.put('/:id', authenticate, requireAdmin, sanitizeBody, categoryController.update);
router.delete('/:id', authenticate, requireAdmin, categoryController.delete);

export default router;
