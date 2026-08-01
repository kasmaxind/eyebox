import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICountryStats {
  country: string;
  views: number;
  watchTime: number;
}

export interface IDeviceStats {
  device: string;
  views: number;
}

export interface IAnalytics extends Document {
  entityType: 'video' | 'channel';
  entityId: Types.ObjectId;
  date: Date;
  views: number;
  watchTime: number;
  ctr: number;
  retention: number;
  subscribers: number;
  revenue: number;
  countries: ICountryStats[];
  devices: IDeviceStats[];
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    entityType: { type: String, enum: ['video', 'channel'], required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    date: { type: Date, required: true, index: true },
    views: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    retention: { type: Number, default: 0 },
    subscribers: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    countries: [{ country: String, views: Number, watchTime: Number }],
    devices: [{ device: String, views: Number }],
  },
  { timestamps: true }
);

analyticsSchema.index({ entityType: 1, entityId: 1, date: -1 }, { unique: true });

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
