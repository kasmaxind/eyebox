import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { getParam } from '../utils/params';

export class UploadController {
  async init(req: Request, res: Response, next: NextFunction) {
    try {
      const { channelId, filename, totalSize, totalChunks } = req.body;
      const result = await uploadService.initSession(
        req.user!.id,
        channelId,
        filename,
        totalSize,
        totalChunks
      );
      res.status(201).json({ success: true, data: result, message: 'Upload session created' });
    } catch (error) {
      next(error);
    }
  }

  async chunk(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.body.sessionId || req.query.sessionId;
      const chunkIndex = parseInt(req.body.chunkIndex || req.query.chunkIndex, 10);
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, message: 'No chunk file provided' });
        return;
      }
      const result = await uploadService.receiveChunk(sessionId as string, chunkIndex, file.path);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const io = req.app.get('io');
      const result = await uploadService.completeUpload(req.body.sessionId, req.user!.id, io);
      res.json({ success: true, data: result, message: 'Upload processing started' });
    } catch (error) {
      next(error);
    }
  }

  async thumbnail(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, message: 'No thumbnail provided' });
        return;
      }
      const result = await uploadService.uploadThumbnail(getParam(req, 'videoId'), req.user!.id, file.path);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async progress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadService.getProgress(getParam(req, 'sessionId'));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
