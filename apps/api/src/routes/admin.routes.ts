import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireModerator } from '../middleware/roles';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate, requireModerator);

router.get('/dashboard', adminController.dashboard);
router.get('/users', requireAdmin, adminController.listUsers);
router.put('/users/:id/role', requireAdmin, auditLog('update_user_role', 'user'), adminController.updateUserRole);
router.put('/users/:id/ban', requireAdmin, auditLog('ban_user', 'user'), adminController.banUser);
router.get('/reports', adminController.listReports);
router.put('/reports/:id', auditLog('resolve_report', 'report'), adminController.resolveReport);
router.put('/comments/:id/moderate', auditLog('moderate_comment', 'comment'), adminController.moderateComment);
router.put('/videos/:id/hide', auditLog('hide_video', 'video'), adminController.hideVideo);
router.put('/channels/:id/verify', requireAdmin, auditLog('verify_channel', 'channel'), adminController.verifyChannel);
router.get('/audit-logs', requireAdmin, adminController.auditLogs);

export default router;
