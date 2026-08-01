import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  user: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: 'stripe' | 'paypal' | 'manual';
  providerId?: string;
  type: 'premium' | 'membership' | 'donation' | 'ad';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'manual'],
      default: 'stripe',
    },
    providerId: { type: String, index: true },
    type: {
      type: String,
      enum: ['premium', 'membership', 'donation', 'ad'],
      required: true,
      index: true,
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
