import { Router } from 'express';
import authRoutes from './auth.routes';
import videoRoutes from './video.routes';
import uploadRoutes from './upload.routes';
import commentRoutes from './comment.routes';
import playlistRoutes from './playlist.routes';
import subscriptionRoutes from './subscription.routes';
import channelRoutes from './channel.routes';
import userRoutes from './user.routes';
import searchRoutes from './search.routes';
import recommendationRoutes from './recommendation.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';
import liveRoutes from './live.routes';
import premiumRoutes from './premium.routes';
import categoryRoutes from './category.routes';
import { generateCsrfToken } from '../middleware/csrf';

const router = Router();

router.get('/csrf-token', generateCsrfToken);

router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/upload', uploadRoutes);
router.use('/comments', commentRoutes);
router.use('/playlists', playlistRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/channels', channelRoutes);
router.use('/users', userRoutes);
router.use('/search', searchRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/live', liveRoutes);
router.use('/premium', premiumRoutes);
router.use('/categories', categoryRoutes);

export default router;
