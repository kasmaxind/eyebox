'use client';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { useState } from 'react';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Platform Settings</h1>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-lg font-semibold text-white">General</h2>
          <Input label="Platform Name" defaultValue="EYEBOX TUBE.AI" />
          <Input label="Support Email" defaultValue="support@eyebox.ai" />
          <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} label="Maintenance mode" />
          <Toggle checked={registrationOpen} onChange={setRegistrationOpen} label="Open registration" />
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-lg font-semibold text-white">Content Moderation</h2>
          <Toggle checked={true} onChange={() => {}} label="Auto-flag suspicious content" />
          <Toggle checked={true} onChange={() => {}} label="Require creator verification" />
          <Input label="Max upload size (GB)" defaultValue="10" type="number" />
        </div>

        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
