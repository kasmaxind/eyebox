'use client';

import { demoAnalyticsData } from '@/lib/demoData';
import StudioStat from '@/components/studio/StudioStat';
import { Eye, Users, Clock } from 'lucide-react';

export default function StudioAnalyticsPage() {
  const maxViews = Math.max(...demoAnalyticsData.map((d) => d.views));
  const totalViews = demoAnalyticsData.reduce((sum, d) => sum + d.views, 0);

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StudioStat label="Total Views (7d)" value={totalViews} change={12.5} icon={<Eye size={18} />} />
        <StudioStat label="New Subscribers" value={342} change={8.2} icon={<Users size={18} />} />
        <StudioStat label="Avg. Watch Time" value="4:32" icon={<Clock size={18} />} />
      </div>

      <div className="p-6 rounded-2xl glass-panel mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Daily Views</h2>
        <div className="flex items-end gap-4 h-48">
          {demoAnalyticsData.map((day) => (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-white/50">{day.views.toLocaleString()}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-cyan to-cyan/30"
                style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-white/40">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel">
        <h2 className="text-lg font-semibold text-white mb-4">Top Videos</h2>
        <div className="space-y-3">
          {['How AI is Reshaping Video Streaming', 'Building Neural Networks from Scratch', 'The Future of Gaming'].map((title, i) => (
            <div key={title} className="flex items-center justify-between py-2 border-b border-glass-border last:border-0">
              <span className="text-sm text-white/70">{i + 1}. {title}</span>
              <span className="text-sm text-cyan">{(50 - i * 12).toFixed(1)}K views</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
