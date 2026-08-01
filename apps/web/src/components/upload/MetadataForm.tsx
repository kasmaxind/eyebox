'use client';

import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { UploadMetadata, VideoCategory, VideoVisibility } from '@/types';
import { CATEGORIES } from '@/lib/constants';

interface MetadataFormProps {
  onSubmit: (data: UploadMetadata) => void;
  isLoading?: boolean;
}

export default function MetadataForm({ onSubmit, isLoading }: MetadataFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UploadMetadata>({
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      category: 'tech' as VideoCategory,
      visibility: 'public' as VideoVisibility,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Title"
        placeholder="Give your video a title"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required', maxLength: { value: 100, message: 'Max 100 characters' } })}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-white/70">Description</label>
        <textarea
          placeholder="Tell viewers about your video"
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-white placeholder:text-white/30 backdrop-blur-sm focus:outline-none focus:border-cyan/50 resize-none"
          {...register('description')}
        />
      </div>

      <Input
        label="Tags"
        placeholder="ai, tech, tutorial (comma separated)"
        {...register('tags')}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-white/70">Category</label>
        <select
          className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-white backdrop-blur-sm focus:outline-none focus:border-cyan/50"
          {...register('category')}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id} className="bg-void-100">{c.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-white/70">Visibility</label>
        <div className="flex gap-3">
          {(['public', 'unlisted', 'private'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={v} {...register('visibility')} className="accent-cyan" />
              <span className="text-sm text-white/70 capitalize">{v}</span>
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Schedule (optional)"
        type="datetime-local"
        {...register('scheduledAt')}
      />

      <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
        Publish Video
      </Button>
    </form>
  );
}
