import { Comment } from '../models/Comment';
import { Report } from '../models/Report';
import { User } from '../models/User';
import { Video } from '../models/Video';
import { aiService } from './ai.service';
import { NotFoundError } from '../utils/errors';

export class ModerationService {
  async moderateComment(commentId: string, moderatorId: string, action: 'approve' | 'hide' | 'delete') {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    switch (action) {
      case 'approve':
        comment.moderated = true;
        comment.spamScore = 0;
        break;
      case 'hide':
        comment.moderated = true;
        comment.deletedAt = new Date();
        break;
      case 'delete':
        comment.deletedAt = new Date();
        break;
    }
    await comment.save();
    return comment;
  }

  async autoModerateComment(text: string): Promise<{ allowed: boolean; spamScore: number }> {
    const spamScore = aiService.detectSpam(text);
    return { allowed: spamScore < 0.7, spamScore };
  }

  async getPendingReports(page = 1, limit = 20) {
    const total = await Report.countDocuments({ status: 'pending' });
    const reports = await Report.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reporter', 'name email');

    return { reports, total, page, limit };
  }

  async resolveReport(reportId: string, moderatorId: string, status: string, resolution?: string) {
    const report = await Report.findById(reportId);
    if (!report) throw new NotFoundError('Report not found');

    report.status = status as 'resolved' | 'dismissed' | 'reviewing';
    report.resolvedBy = moderatorId as unknown as import('mongoose').Types.ObjectId;
    report.resolution = resolution;
    await report.save();
    return report;
  }

  async banUser(userId: string, banned = true) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    user.banned = banned;
    if (banned) user.devices = [];
    await user.save();
    return user;
  }

  async hideVideo(videoId: string) {
    const video = await Video.findById(videoId);
    if (!video) throw new NotFoundError('Video not found');
    video.visibility = 'private';
    await video.save();
    return video;
  }
}

export const moderationService = new ModerationService();
