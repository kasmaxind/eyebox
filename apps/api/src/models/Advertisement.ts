import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
  title: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  clickUrl: string;
  placement: 'pre-roll' | 'mid-roll' | 'banner' | 'sidebar';
  targetCategories: string[];
  impressions: number;
  clicks: number;
  budget: number;
  spent: number;
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const advertisementSchema = new Schema<IAdvertisement>(
  {
    title: { type: String, required: true },
    description: String,
    videoUrl: String,
    imageUrl: String,
    clickUrl: { type: String, required: true },
    placement: {
      type: String,
      enum: ['pre-roll', 'mid-roll', 'banner', 'sidebar'],
      default: 'banner',
      index: true,
    },
    targetCategories: { type: [String], default: [] },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export const Advertisement = mongoose.model<IAdvertisement>('Advertisement', advertisementSchema);
