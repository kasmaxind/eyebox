import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  subscriber: Types.ObjectId;
  channel: Types.ObjectId;
  notifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriber: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    notifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
subscriptionSchema.index({ channel: 1, createdAt: -1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
