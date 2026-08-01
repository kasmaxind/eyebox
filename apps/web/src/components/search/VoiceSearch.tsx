'use client';

import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceSearchProps {
  onResult?: (text: string) => void;
  className?: string;
}

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  onresult: (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export default function VoiceSearch({ onResult, className }: VoiceSearchProps) {
  const handleVoiceSearch = () => {
    const win = window as Window & {
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
      SpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognition = win.webkitSpeechRecognition || win.SpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult?.(transcript);
    };

    recognition.start();
  };

  return (
    <button
      onClick={handleVoiceSearch}
      className={cn(
        'p-2.5 rounded-xl bg-glass border border-glass-border text-white/70 hover:text-cyan hover:border-cyan/30 transition-all',
        className
      )}
      aria-label="Voice search"
    >
      <Mic size={18} />
    </button>
  );
}
