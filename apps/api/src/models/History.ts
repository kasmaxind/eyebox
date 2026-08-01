import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IHistory extends Document {
  user: Types.ObjectId;
  video: Types.ObjectId;
  watchedSeconds: number;
  progress: number;
  completed: boolean;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const historySchema = new Schema<IHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
    watchedSeconds: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

historySchema.index({ user: 1, video: 1 }, { unique: true });
historySchema.index({ user: 1, lastWatchedAt: -1 });

export const History = mongoose.model<IHistory>('History', historySchema);
