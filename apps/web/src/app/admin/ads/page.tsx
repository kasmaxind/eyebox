'use client';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { useState } from 'react';

export default function AdminAdsPage() {
  const [adsEnabled, setAdsEnabled] = useState(true);

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Ad Management</h1>

      <div className="p-6 rounded-2xl glass-panel mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Global Ad Serving</h2>
            <p className="text-sm text-white/50">Enable or disable ads platform-wide</p>
          </div>
          <Toggle checked={adsEnabled} onChange={setAdsEnabled} />
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel">
        <h2 className="text-lg font-semibold text-white mb-4">Active Campaigns</h2>
        <div className="space-y-3">
          {[
            { name: 'Tech Summit 2026', status: 'active', impressions: '2.4M', budget: '$15,000' },
            { name: 'Gaming Hardware Launch', status: 'active', impressions: '1.8M', budget: '$12,000' },
            { name: 'Music Festival Promo', status: 'paused', impressions: '890K', budget: '$8,000' },
          ].map((campaign) => (
            <div key={campaign.name} className="flex items-center justify-between p-4 rounded-xl bg-glass border border-glass-border">
              <div>
                <p className="text-white font-medium">{campaign.name}</p>
                <p className="text-sm text-white/40">{campaign.impressions} impressions · {campaign.budget}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={campaign.status === 'active' ? 'green' : 'amber'}>{campaign.status}</Badge>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
