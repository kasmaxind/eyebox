import { Request, Response, NextFunction } from 'express';
import { recommendationService } from '../services/recommendation.service';

export class RecommendationController {
  async personalized(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recommendationService.getPersonalizedFeed(
        req.user!.id,
        parseInt(req.query.limit as string) || 20,
        req.query.cursor as string
      );
      res.json({ success: true, data: result.videos, meta: { nextCursor: result.nextCursor } });
    } catch (error) {
      next(error);
    }
  }

  async home(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await recommendationService.getHomeSections(req.user?.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationController = new RecommendationController();
