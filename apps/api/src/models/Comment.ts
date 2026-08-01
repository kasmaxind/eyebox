import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  video: Types.ObjectId;
  user: Types.ObjectId;
  parent?: Types.ObjectId;
  text: string;
  likes: number;
  hearts: number;
  pinned: boolean;
  timestamps: number[];
  moderated: boolean;
  spamScore: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', index: true },
    text: { type: String, required: true, maxlength: 5000 },
    likes: { type: Number, default: 0 },
    hearts: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    timestamps: { type: [Number], default: [] },
    moderated: { type: Boolean, default: false },
    spamScore: { type: Number, default: 0, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ parent: 1, createdAt: 1 });
commentSchema.index({ text: 'text' });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
