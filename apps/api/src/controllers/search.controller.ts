import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      if (!q) {
        res.json({ success: true, data: { videos: [], channels: [], categories: [] } });
        return;
      }
      const result = await searchService.search(
        q,
        req.query.type as string,
        parseInt(req.query.limit as string) || 20
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async suggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await searchService.getSuggestions(req.query.q as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
