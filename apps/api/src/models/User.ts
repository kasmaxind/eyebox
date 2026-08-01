import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserRole } from '../types';

export interface IDevice {
  deviceId: string;
  name: string;
  userAgent: string;
  ip: string;
  lastActive: Date;
  refreshTokenHash: string;
}

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoplay: boolean;
  quality: string;
}

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name: string;
  avatar?: string;
  role: UserRole;
  googleId?: string;
  isEmailVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  devices: IDevice[];
  premiumUntil?: Date;
  preferences: IUserPreferences;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    deviceId: { type: String, required: true },
    name: { type: String, default: 'Unknown Device' },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    lastActive: { type: Date, default: Date.now },
    refreshTokenHash: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    name: { type: String, required: true, trim: true },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['guest', 'user', 'creator', 'moderator', 'admin'],
      default: 'user',
      index: true,
    },
    googleId: { type: String, sparse: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    devices: { type: [deviceSchema], default: [] },
    premiumUntil: { type: Date },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, default: 'en' },
      autoplay: { type: Boolean, default: true },
      quality: { type: String, default: 'auto' },
    },
    banned: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
