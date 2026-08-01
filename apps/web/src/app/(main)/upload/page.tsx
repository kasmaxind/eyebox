'use client';

import { useState } from 'react';
import UploadDropzone from '@/components/upload/UploadDropzone';
import UploadProgress from '@/components/upload/UploadProgress';
import MetadataForm from '@/components/upload/MetadataForm';
import type { UploadMetadata } from '@/types';

type UploadStep = 'select' | 'uploading' | 'metadata' | 'complete';

export default function UploadPage() {
  const [step, setStep] = useState<UploadStep>('select');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setStep('uploading');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('metadata');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const handleMetadataSubmit = (data: UploadMetadata) => {
    console.log('Publishing:', { file: file?.name, ...data });
    setStep('complete');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-orbitron font-bold text-white mb-2">Upload Video</h1>
      <p className="text-white/50 mb-8">Share your content with the world</p>

      {step === 'select' && (
        <UploadDropzone onFileSelect={handleFileSelect} />
      )}

      {step === 'uploading' && file && (
        <UploadProgress
          progress={Math.min(progress, 100)}
          fileName={file.name}
          status={progress >= 100 ? 'processing' : 'uploading'}
        />
      )}

      {step === 'metadata' && (
        <div className="space-y-6">
          {file && (
            <UploadProgress progress={100} fileName={file.name} status="complete" />
          )}
          <div className="p-6 rounded-2xl glass-panel">
            <h2 className="text-lg font-semibold text-white mb-4">Video Details</h2>
            <MetadataForm onSubmit={handleMetadataSubmit} />
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Video Published!</h2>
          <p className="text-white/50">Your video is being processed and will be available shortly.</p>
        </div>
      )}
    </div>
  );
}
