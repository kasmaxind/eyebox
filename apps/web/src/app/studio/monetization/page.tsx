'use client';

import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import StudioStat from '@/components/studio/StudioStat';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function StudioMonetizationPage() {
  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Monetization</h1>

      <div className="p-6 rounded-2xl glass-panel border-amber/20 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="green">Active</Badge>
          <span className="text-sm text-white/50">Partner Program</span>
        </div>
        <p className="text-white/70 mb-4">Your channel is enrolled in the EYEBOX Partner Program. Keep creating great content to grow your revenue.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StudioStat label="Estimated Revenue" value="$4,280" change={15.3} icon={<DollarSign size={18} />} />
        <StudioStat label="RPM" value="$3.42" change={5.1} icon={<TrendingUp size={18} />} />
        <StudioStat label="Next Payout" value="Aug 15" icon={<CreditCard size={18} />} />
      </div>

      <div className="p-6 rounded-2xl glass-panel">
        <h2 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h2>
        <div className="space-y-4">
          {[
            { source: 'Ad Revenue', amount: '$2,840', pct: 66 },
            { source: 'Channel Memberships', amount: '$980', pct: 23 },
            { source: 'Super Thanks', amount: '$460', pct: 11 },
          ].map((item) => (
            <div key={item.source}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">{item.source}</span>
                <span className="text-white font-medium">{item.amount}</span>
              </div>
              <div className="h-2 rounded-full bg-void-200">
                <div className="h-full rounded-full bg-amber" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" className="mt-6">View Payment History</Button>
      </div>
    </div>
  );
}
