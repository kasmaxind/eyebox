import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LiveStream } from '../models/LiveStream';
import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class LiveController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const streams = await LiveStream.find({ status: 'live' })
        .sort({ viewerCount: -1 })
        .limit(20)
        .populate('channel', 'name handle logo verified')
        .populate('host', 'name avatar');
      res.json({ success: true, data: streams });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await Channel.findOne({ owner: req.user!.id });
      if (!channel) throw new NotFoundError('Channel not found');

      const stream = await LiveStream.create({
        channel: channel._id,
        host: req.user!.id,
        title: req.body.title,
        description: req.body.description,
        streamKey: uuidv4(),
        scheduledAt: req.body.scheduledAt,
        status: req.body.scheduledAt ? 'scheduled' : 'live',
        startedAt: req.body.scheduledAt ? undefined : new Date(),
      });

      if (!req.body.scheduledAt) {
        await Video.create({
          channel: channel._id,
          uploader: req.user!.id,
          title: req.body.title,
          slug: `live-${stream._id}`,
          status: 'live',
          isLive: true,
          liveStreamId: stream._id,
          visibility: 'public',
        });
      }

      res.status(201).json({ success: true, data: stream, message: 'Live stream created' });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const stream = await LiveStream.findById(req.params.id)
        .populate('channel', 'name handle logo verified')
        .populate('host', 'name avatar');
      if (!stream) throw new NotFoundError('Stream not found');
      res.json({ success: true, data: stream });
    } catch (error) {
      next(error);
    }
  }

  async end(req: Request, res: Response, next: NextFunction) {
    try {
      const stream = await LiveStream.findById(req.params.id);
      if (!stream) throw new NotFoundError('Stream not found');
      if (stream.host.toString() !== req.user!.id) throw new ForbiddenError('Not authorized');

      stream.status = 'ended';
      stream.endedAt = new Date();
      await stream.save();

      await Video.updateMany(
        { liveStreamId: stream._id },
        { status: 'ready', isLive: false }
      );

      res.json({ success: true, data: stream, message: 'Stream ended' });
    } catch (error) {
      next(error);
    }
  }

  async updateViewers(req: Request, res: Response, next: NextFunction) {
    try {
      const stream = await LiveStream.findByIdAndUpdate(
        req.params.id,
        {
          viewerCount: req.body.viewerCount,
          $max: { peakViewers: req.body.viewerCount },
        },
        { new: true }
      );
      res.json({ success: true, data: stream });
    } catch (error) {
      next(error);
    }
  }
}

export const liveController = new LiveController();
