import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWatchLater extends Document {
  user: Types.ObjectId;
  video: Types.ObjectId;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const watchLaterSchema = new Schema<IWatchLater>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

watchLaterSchema.index({ user: 1, video: 1 }, { unique: true });
watchLaterSchema.index({ user: 1, addedAt: -1 });

export const WatchLater = mongoose.model<IWatchLater>('WatchLater', watchLaterSchema);
