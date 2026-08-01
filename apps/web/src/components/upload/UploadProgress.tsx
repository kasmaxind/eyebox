'use client';

import { cn } from '@/lib/utils';

interface UploadProgressProps {
  progress: number;
  fileName: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

export default function UploadProgress({ progress, fileName, status }: UploadProgressProps) {
  const statusLabels = {
    uploading: 'Uploading...',
    processing: 'Processing video...',
    complete: 'Upload complete!',
    error: 'Upload failed',
  };

  return (
    <div className="p-6 rounded-2xl bg-glass border border-glass-border backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white truncate flex-1 mr-4">{fileName}</p>
        <span className={cn(
          'text-xs font-medium',
          status === 'complete' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-cyan'
        )}>
          {statusLabels[status]}
        </span>
      </div>
      <div className="h-2 rounded-full bg-void-200 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            status === 'error' ? 'bg-red-500' : status === 'complete' ? 'bg-green-500' : 'bg-cyan'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-white/40 mt-2">{Math.round(progress)}%</p>
    </div>
  );
}
