import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPlaylistVideo {
  video: Types.ObjectId;
  addedAt: Date;
  position: number;
}

export interface ISmartRules {
  tags?: string[];
  category?: Types.ObjectId;
  maxAge?: number;
}

export interface IPlaylist extends Document {
  owner: Types.ObjectId;
  title: string;
  description?: string;
  visibility: 'public' | 'unlisted' | 'private';
  collaborative: boolean;
  collaborators: Types.ObjectId[];
  videos: IPlaylistVideo[];
  smartRules?: ISmartRules;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 5000 },
    visibility: {
      type: String,
      enum: ['public', 'unlisted', 'private'],
      default: 'public',
      index: true,
    },
    collaborative: { type: Boolean, default: false },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    videos: [
      {
        video: { type: Schema.Types.ObjectId, ref: 'Video' },
        addedAt: { type: Date, default: Date.now },
        position: { type: Number, default: 0 },
      },
    ],
    smartRules: {
      tags: [String],
      category: { type: Schema.Types.ObjectId, ref: 'Category' },
      maxAge: Number,
    },
    thumbnail: String,
  },
  { timestamps: true }
);

playlistSchema.index({ title: 'text' });
playlistSchema.index({ owner: 1, createdAt: -1 });

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
