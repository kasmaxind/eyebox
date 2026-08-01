'use client';

import { Radio } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function StudioLivePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Go Live</h1>

      <div className="p-8 rounded-2xl glass-panel text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
          <Radio size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Start a Live Stream</h2>
        <p className="text-white/50 mb-6">Connect your streaming software or go live directly from your browser.</p>
      </div>

      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <Input label="Stream Title" placeholder="What are you streaming?" />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white/70">Description</label>
          <textarea
            placeholder="Tell viewers what to expect"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-cyan/50"
          />
        </div>
        <div className="p-4 rounded-xl bg-void-200 text-sm">
          <p className="text-white/50 mb-1">Stream Key</p>
          <code className="text-cyan text-xs break-all">live_sk_eyebox_xxxxxxxxxxxxxxxx</code>
        </div>
        <Button variant="danger" className="w-full">
          <Radio size={18} /> Go Live
        </Button>
      </div>
    </div>
  );
}
