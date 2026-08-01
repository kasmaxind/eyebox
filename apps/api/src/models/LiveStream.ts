import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILiveStream extends Document {
  channel: Types.ObjectId;
  host: Types.ObjectId;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended';
  streamKey: string;
  playbackUrl?: string;
  thumbnail?: string;
  viewerCount: number;
  peakViewers: number;
  startedAt?: Date;
  endedAt?: Date;
  scheduledAt?: Date;
  chatEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const liveStreamSchema = new Schema<ILiveStream>(
  {
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'scheduled',
      index: true,
    },
    streamKey: { type: String, required: true, unique: true },
    playbackUrl: String,
    thumbnail: String,
    viewerCount: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    startedAt: Date,
    endedAt: Date,
    scheduledAt: { type: Date, index: true },
    chatEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

liveStreamSchema.index({ status: 1, viewerCount: -1 });

export const LiveStream = mongoose.model<ILiveStream>('LiveStream', liveStreamSchema);
