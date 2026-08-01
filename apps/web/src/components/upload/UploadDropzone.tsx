'use client';

import { useCallback, useState } from 'react';
import { Upload, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export default function UploadDropzone({ onFileSelect, accept = 'video/*' }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
        isDragging
          ? 'border-cyan bg-cyan/5'
          : 'border-glass-border bg-glass hover:border-cyan/30 hover:bg-glass-hover'
      )}
    >
      <input type="file" accept={accept} onChange={handleChange} className="hidden" />
      <div className="p-4 rounded-2xl bg-cyan/10 border border-cyan/20">
        <Upload size={32} className="text-cyan" />
      </div>
      <div className="text-center">
        <p className="text-white font-medium">Drag and drop your video here</p>
        <p className="text-sm text-white/40 mt-1">or click to browse files</p>
        <p className="text-xs text-white/25 mt-2">MP4, MOV, AVI up to 10GB</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/30">
        <Film size={14} />
        Select a video file to upload
      </div>
    </label>
  );
}
