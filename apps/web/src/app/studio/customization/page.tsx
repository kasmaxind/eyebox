'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';

export default function StudioCustomizationPage() {
  const { user } = useAuth();
  const [channelName, setChannelName] = useState('Neural Vision');
  const [description, setDescription] = useState('Exploring the frontier of AI, machine learning, and the future of technology.');

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Customization</h1>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl glass-panel">
          <h2 className="text-lg font-semibold text-white mb-4">Branding</h2>
          <div className="flex items-center gap-4 mb-6">
            <Avatar src={user?.avatar} name={channelName} size="xl" />
            <Button variant="secondary" size="sm">Change Avatar</Button>
          </div>
          <div className="h-32 rounded-xl bg-void-200 mb-4 flex items-center justify-center text-white/30 text-sm">
            Banner image — 2560 × 1440 recommended
          </div>
          <Button variant="secondary" size="sm">Upload Banner</Button>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-lg font-semibold text-white mb-2">Basic Info</h2>
          <Input label="Channel Name" value={channelName} onChange={(e) => setChannelName(e.target.value)} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white/70">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-white resize-none focus:outline-none focus:border-cyan/50"
            />
          </div>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
