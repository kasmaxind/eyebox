import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parent?: mongoose.Types.ObjectId;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: String,
    icon: String,
    color: String,
    parent: { type: Schema.Types.ObjectId, ref: 'Category' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

categorySchema.index({ name: 'text' });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
