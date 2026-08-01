import mongoose, { Schema, Document, Types } from 'mongoose';
import { LikeTargetType, LikeValue } from '../types';

export interface ILike extends Document {
  user: Types.ObjectId;
  targetType: LikeTargetType;
  targetId: Types.ObjectId;
  value: LikeValue;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['video', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    value: { type: String, enum: ['like', 'dislike'], required: true },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1, value: 1 });

export const Like = mongoose.model<ILike>('Like', likeSchema);
