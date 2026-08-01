'use client';

import { useQuery } from '@tanstack/react-query';
import { Eye, Users, Clock, DollarSign } from 'lucide-react';
import StudioStat from '@/components/studio/StudioStat';
import ContentTable from '@/components/studio/ContentTable';
import api, { safeApiCall } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { demoStudioStats, demoStudioContent, demoAnalyticsData } from '@/lib/demoData';
import type { StudioStats } from '@/types';
import Link from 'next/link';

export default function StudioDashboard() {
  const { data: stats } = useQuery({
    queryKey: queryKeys.studio.stats,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<StudioStats>('/studio/stats');
        return data;
      }, demoStudioStats),
  });

  const maxViews = Math.max(...demoAnalyticsData.map((d) => d.views));

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StudioStat label="Views (28 days)" value={stats?.views ?? 0} change={stats?.viewsChange} icon={<Eye size={18} />} />
        <StudioStat label="Subscribers" value={stats?.subscribers ?? 0} change={stats?.subscribersChange} icon={<Users size={18} />} />
        <StudioStat label="Watch time (hrs)" value={stats?.watchTime ?? 0} change={stats?.watchTimeChange} icon={<Clock size={18} />} />
        <StudioStat label="Revenue ($)" value={stats?.revenue ?? 0} change={stats?.revenueChange} icon={<DollarSign size={18} />} />
      </div>

      {/* Analytics chart */}
      <div className="p-6 rounded-2xl glass-panel mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Views — Last 7 Days</h2>
        <div className="flex items-end gap-3 h-40">
          {demoAnalyticsData.map((day) => (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-cyan/60 to-cyan/20 transition-all hover:from-cyan/80"
                style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-xs text-white/40">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Content</h2>
        <Link href="/studio/content" className="text-sm text-cyan hover:text-cyan-dim">View all</Link>
      </div>
      <ContentTable items={demoStudioContent as Parameters<typeof ContentTable>[0]['items']} />
    </div>
  );
}
