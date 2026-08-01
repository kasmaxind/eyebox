import { Request, Response, NextFunction } from 'express';
import { videoService } from '../services/video.service';
import { getParam } from '../utils/params';

export class VideoController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await videoService.create({
        channelId: req.body.channelId,
        uploaderId: req.user!.id,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        category: req.body.category,
        language: req.body.language,
        visibility: req.body.visibility,
        isShort: req.body.isShort,
      });
      res.status(201).json({ success: true, data: video, message: 'Video created' });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await videoService.getById(getParam(req, 'id'), req.user?.id, true);
      res.json({ success: true, data: video });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await videoService.update(getParam(req, 'id'), req.user!.id, req.body);
      res.json({ success: true, data: video, message: 'Video updated' });
    } catch (error) {
      next(error);
    }
  }

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await videoService.publish(getParam(req, 'id'), req.user!.id);
      res.json({ success: true, data: video, message: 'Video published' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await videoService.softDelete(getParam(req, 'id'), req.user!.id);
      res.json({ success: true, message: 'Video deleted' });
    } catch (error) {
      next(error);
    }
  }

  async feed(req: Request, res: Response, next: NextFunction) {
    try {
      const { videos, nextCursor, limit } = await videoService.getFeed({
        cursor: req.query.cursor as string,
        limit: parseInt(req.query.limit as string) || 20,
        category: req.query.category as string,
        channelId: req.query.channelId as string,
      });
      res.json({ success: true, data: videos, meta: { limit, nextCursor } });
    } catch (error) {
      next(error);
    }
  }

  async trending(req: Request, res: Response, next: NextFunction) {
    try {
      const videos = await videoService.getTrending(parseInt(req.query.limit as string) || 20);
      res.json({ success: true, data: videos });
    } catch (error) {
      next(error);
    }
  }

  async shorts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await videoService.getShorts(
        parseInt(req.query.limit as string) || 20,
        req.query.cursor as string
      );
      res.json({ success: true, data: result.videos, meta: { nextCursor: result.nextCursor } });
    } catch (error) {
      next(error);
    }
  }

  async live(req: Request, res: Response, next: NextFunction) {
    try {
      const videos = await videoService.getLive(parseInt(req.query.limit as string) || 20);
      res.json({ success: true, data: videos });
    } catch (error) {
      next(error);
    }
  }

  async likeDislike(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await videoService.likeDislike(req.user!.id, getParam(req, 'id'), req.body.value);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async report(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await videoService.reportVideo(
        req.user!.id,
        getParam(req, 'id'),
        req.body.reason,
        req.body.details
      );
      res.status(201).json({ success: true, data: report, message: 'Report submitted' });
    } catch (error) {
      next(error);
    }
  }

  async related(req: Request, res: Response, next: NextFunction) {
    try {
      const videos = await videoService.getRelated(getParam(req, 'id'));
      res.json({ success: true, data: videos });
    } catch (error) {
      next(error);
    }
  }
}

export const videoController = new VideoController();
