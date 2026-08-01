import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICommunityPost extends Document {
  channel: Types.ObjectId;
  author: Types.ObjectId;
  type: 'text' | 'image' | 'poll' | 'video';
  title?: string;
  content: string;
  mediaUrl?: string;
  pollOptions?: { text: string; votes: number }[];
  likes: number;
  commentsCount: number;
  pinned: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>(
  {
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['text', 'image', 'poll', 'video'],
      default: 'text',
    },
    title: String,
    content: { type: String, required: true, maxlength: 10000 },
    mediaUrl: String,
    pollOptions: [{ text: String, votes: { type: Number, default: 0 } }],
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

communityPostSchema.index({ channel: 1, createdAt: -1 });
communityPostSchema.index({ content: 'text', title: 'text' });

export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
