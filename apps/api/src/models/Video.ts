import mongoose, { Schema, Document, Types } from 'mongoose';
import { VideoVisibility, VideoStatus } from '../types';

export interface IThumbnail {
  url: string;
  isAuto: boolean;
  isSelected: boolean;
}

export interface IVideoFile {
  quality: number;
  url: string;
  bitrate?: number;
  width?: number;
  height?: number;
  codec?: string;
}

export interface IAiChapter {
  title: string;
  start: number;
  end: number;
}

export interface ICaption {
  lang: string;
  url: string;
  isAuto: boolean;
}

export interface IVideo extends Document {
  channel: Types.ObjectId;
  uploader: Types.ObjectId;
  title: string;
  description?: string;
  slug: string;
  tags: string[];
  category?: Types.ObjectId;
  language: string;
  ageRestricted: boolean;
  visibility: VideoVisibility;
  scheduledAt?: Date;
  premiere: boolean;
  status: VideoStatus;
  thumbnails: IThumbnail[];
  videoFiles: IVideoFile[];
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  commentsCount: number;
  processingProgress: number;
  aiSummary?: string;
  aiChapters: IAiChapter[];
  captions: ICaption[];
  allowComments: boolean;
  allowDownload: boolean;
  isShort: boolean;
  isLive: boolean;
  liveStreamId?: Types.ObjectId;
  publishedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 10000 },
    slug: { type: String, required: true, unique: true, index: true },
    tags: { type: [String], default: [], index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    language: { type: String, default: 'en' },
    ageRestricted: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: ['public', 'unlisted', 'private', 'scheduled'],
      default: 'private',
      index: true,
    },
    scheduledAt: { type: Date, index: true },
    premiere: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed', 'live'],
      default: 'uploading',
      index: true,
    },
    thumbnails: [
      {
        url: String,
        isAuto: { type: Boolean, default: false },
        isSelected: { type: Boolean, default: false },
      },
    ],
    videoFiles: [
      {
        quality: Number,
        url: String,
        bitrate: Number,
        width: Number,
        height: Number,
        codec: String,
      },
    ],
    duration: { type: Number, default: 0 },
    views: { type: Number, default: 0, index: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    processingProgress: { type: Number, default: 0 },
    aiSummary: { type: String },
    aiChapters: [{ title: String, start: Number, end: Number }],
    captions: [{ lang: String, url: String, isAuto: Boolean }],
    allowComments: { type: Boolean, default: true },
    allowDownload: { type: Boolean, default: false },
    isShort: { type: Boolean, default: false, index: true },
    isLive: { type: Boolean, default: false, index: true },
    liveStreamId: { type: Schema.Types.ObjectId, ref: 'LiveStream' },
    publishedAt: { type: Date, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ views: -1, publishedAt: -1 });
videoSchema.index({ channel: 1, publishedAt: -1 });
videoSchema.index({ category: 1, views: -1 });
videoSchema.index({ deletedAt: 1 }, { sparse: true });

export const Video = mongoose.model<IVideo>('Video', videoSchema);
