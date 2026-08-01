'use client';

import { demoAnalyticsData } from '@/lib/demoData';
import AdminStat from '@/components/admin/AdminStat';
import { Users, Video, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const maxViews = Math.max(...demoAnalyticsData.map((d) => d.views));

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Platform Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <AdminStat label="DAU" value={89000} icon={<Users size={18} className="text-cyan" />} />
        <AdminStat label="Videos Uploaded (24h)" value={12400} icon={<Video size={18} className="text-cyan" />} />
        <AdminStat label="Concurrent Streams" value={3420} icon={<Activity size={18} className="text-green-400" />} />
      </div>

      <div className="p-6 rounded-2xl glass-panel">
        <h2 className="text-lg font-semibold text-white mb-4">Platform Views — Last 7 Days</h2>
        <div className="flex items-end gap-4 h-48">
          {demoAnalyticsData.map((day) => (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-white/50">{(day.views * 100).toLocaleString()}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-cyan to-cyan/30"
                style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-white/40">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
