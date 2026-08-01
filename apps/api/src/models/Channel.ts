import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISocialLinks {
  youtube?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  discord?: string;
}

export interface IChannelBranding {
  primaryColor?: string;
  accentColor?: string;
  watermark?: string;
}

export interface IChannel extends Document {
  owner: Types.ObjectId;
  name: string;
  handle: string;
  description?: string;
  banner?: string;
  logo?: string;
  socialLinks: ISocialLinks;
  verified: boolean;
  subscriberCount: number;
  videoCount: number;
  branding: IChannelBranding;
  membershipsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, maxlength: 5000 },
    banner: { type: String },
    logo: { type: String },
    socialLinks: {
      youtube: String,
      twitter: String,
      instagram: String,
      website: String,
      discord: String,
    },
    verified: { type: Boolean, default: false, index: true },
    subscriberCount: { type: Number, default: 0, index: true },
    videoCount: { type: Number, default: 0 },
    branding: {
      primaryColor: String,
      accentColor: String,
      watermark: String,
    },
    membershipsEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

channelSchema.index({ name: 'text', description: 'text' });
channelSchema.index({ subscriberCount: -1 });

export const Channel = mongoose.model<IChannel>('Channel', channelSchema);
