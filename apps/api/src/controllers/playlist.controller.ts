import { Request, Response, NextFunction } from 'express';
import { Playlist } from '../models/Playlist';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class PlaylistController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const query: Record<string, unknown> = { owner: req.user!.id };
      if (req.query.visibility) query.visibility = req.query.visibility;

      const total = await Playlist.countDocuments(query);
      const playlists = await Playlist.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({ success: true, data: playlists, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const playlist = await Playlist.findById(req.params.id)
        .populate({ path: 'videos.video', populate: { path: 'channel', select: 'name handle logo' } });
      if (!playlist) throw new NotFoundError('Playlist not found');

      if (playlist.visibility === 'private' && playlist.owner.toString() !== req.user?.id) {
        throw new ForbiddenError('Private playlist');
      }

      res.json({ success: true, data: playlist });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const playlist = await Playlist.create({
        owner: req.user!.id,
        title: req.body.title,
        description: req.body.description,
        visibility: req.body.visibility || 'public',
        collaborative: req.body.collaborative || false,
      });
      res.status(201).json({ success: true, data: playlist, message: 'Playlist created' });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const playlist = await Playlist.findById(req.params.id);
      if (!playlist) throw new NotFoundError('Playlist not found');
      if (playlist.owner.toString() !== req.user!.id) throw new ForbiddenError('Not authorized');

      Object.assign(playlist, req.body);
      await playlist.save();
      res.json({ success: true, data: playlist, message: 'Playlist updated' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const playlist = await Playlist.findById(req.params.id);
      if (!playlist) throw new NotFoundError('Playlist not found');
      if (playlist.owner.toString() !== req.user!.id) throw new ForbiddenError('Not authorized');

      await Playlist.deleteOne({ _id: req.params.id });
      res.json({ success: true, message: 'Playlist deleted' });
    } catch (error) {
      next(error);
    }
  }

  async addVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const playlist = await Playlist.findById(req.params.id);
      if (!playlist) throw new NotFoundError('Playlist not found');
      if (playlist.owner.toString() !== req.user!.id) throw new ForbiddenError('Not authorized');

      const exists = playlist.videos.some((v) => v.video.toString() === req.body.videoId);
      if (!exists) {
        playlist.videos.push({
          video: req.body.videoId,
          addedAt: new Date(),
          position: playlist.videos.length,
        });
        await playlist.save();
      }
      res.json({ success: true, data: playlist, message: 'Video added to playlist' });
    } catch (error) {
      next(error);
    }
  }

  async removeVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const playlist = await Playlist.findById(req.params.id);
      if (!playlist) throw new NotFoundError('Playlist not found');
      if (playlist.owner.toString() !== req.user!.id) throw new ForbiddenError('Not authorized');

      playlist.videos = playlist.videos.filter((v) => v.video.toString() !== req.params.videoId);
      await playlist.save();
      res.json({ success: true, data: playlist, message: 'Video removed from playlist' });
    } catch (error) {
      next(error);
    }
  }
}

export const playlistController = new PlaylistController();
