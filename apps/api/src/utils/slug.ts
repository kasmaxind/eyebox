import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

export function createSlug(text: string): string {
  const base = slugify(text, { lower: true, strict: true, trim: true });
  return `${base}-${uuidv4().slice(0, 8)}`;
}

export function createHandle(name: string): string {
  const base = slugify(name, { lower: true, strict: true, trim: true });
  return base.slice(0, 30) || `user-${uuidv4().slice(0, 8)}`;
}
