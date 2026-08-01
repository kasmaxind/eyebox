import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment';
import { Video } from '../models/Video';
import { Like } from '../models/Like';
import { moderationService } from '../services/moderation.service';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class CommentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const query = {
        video: req.params.videoId,
        parent: null,
        deletedAt: null,
      };
      const total = await Comment.countDocuments(query);
      const comments = await Comment.find(query)
        .sort({ pinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name avatar');

      const withReplies = await Promise.all(
        comments.map(async (c) => {
          const replies = await Comment.find({ parent: c._id, deletedAt: null })
            .sort({ createdAt: 1 })
            .limit(5)
            .populate('user', 'name avatar');
          return { ...c.toObject(), replies };
        })
      );

      res.json({ success: true, data: withReplies, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { spamScore, allowed } = await moderationService.autoModerateComment(req.body.text);
      if (!allowed) {
        res.status(400).json({ success: false, message: 'Comment flagged as spam' });
        return;
      }

      const comment = await Comment.create({
        video: req.params.videoId,
        user: req.user!.id,
        parent: req.body.parent,
        text: req.body.text,
        spamScore,
        timestamps: req.body.timestamps || [],
      });

      await Video.updateOne({ _id: req.params.videoId }, { $inc: { commentsCount: 1 } });
      const populated = await Comment.findById(comment._id).populate('user', 'name avatar');
      res.status(201).json({ success: true, data: populated, message: 'Comment added' });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) throw new NotFoundError('Comment not found');
      if (comment.user.toString() !== req.user!.id) throw new ForbiddenError('Not authorized');

      comment.text = req.body.text;
      await comment.save();
      res.json({ success: true, data: comment, message: 'Comment updated' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) throw new NotFoundError('Comment not found');
      if (comment.user.toString() !== req.user!.id && req.user!.role !== 'admin') {
        throw new ForbiddenError('Not authorized');
      }

      comment.deletedAt = new Date();
      await comment.save();
      await Video.updateOne({ _id: comment.video }, { $inc: { commentsCount: -1 } });
      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  }

  async like(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await Like.findOne({
        user: req.user!.id,
        targetType: 'comment',
        targetId: req.params.id,
      });

      if (existing) {
        await Like.deleteOne({ _id: existing._id });
        await Comment.updateOne({ _id: req.params.id }, { $inc: { likes: -1 } });
        res.json({ success: true, data: { action: 'removed' } });
        return;
      }

      await Like.create({
        user: req.user!.id,
        targetType: 'comment',
        targetId: req.params.id,
        value: 'like',
      });
      await Comment.updateOne({ _id: req.params.id }, { $inc: { likes: 1 } });
      res.json({ success: true, data: { action: 'added' } });
    } catch (error) {
      next(error);
    }
  }

  async pin(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) throw new NotFoundError('Comment not found');

      const video = await Video.findById(comment.video).populate('channel');
      const channel = video?.channel as { owner?: { toString: () => string } };
      if (channel?.owner?.toString() !== req.user!.id) throw new ForbiddenError('Not authorized');

      comment.pinned = req.body.pinned ?? true;
      await comment.save();
      res.json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
