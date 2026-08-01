'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Video, Tv, Flag, Activity, DollarSign } from 'lucide-react';
import AdminStat from '@/components/admin/AdminStat';
import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import api, { safeApiCall } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { demoAdminStats, demoReports } from '@/lib/demoData';
import type { AdminStats } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<AdminStats>('/admin/stats');
        return data;
      }, demoAdminStats),
  });

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Admin Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <AdminStat label="Total Users" value={stats?.totalUsers ?? 0} icon={<Users size={18} className="text-cyan" />} />
        <AdminStat label="Total Videos" value={stats?.totalVideos ?? 0} icon={<Video size={18} className="text-cyan" />} />
        <AdminStat label="Channels" value={stats?.totalChannels ?? 0} icon={<Tv size={18} className="text-cyan" />} />
        <AdminStat label="Pending Reports" value={stats?.pendingReports ?? 0} alert icon={<Flag size={18} className="text-red-400" />} />
        <AdminStat label="Active Users (24h)" value={stats?.activeUsers ?? 0} icon={<Activity size={18} className="text-green-400" />} />
        <AdminStat label="Revenue ($)" value={stats?.revenue ?? 0} icon={<DollarSign size={18} className="text-amber" />} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Reports</h2>
        <Link href="/admin/reports" className="text-sm text-cyan">View all</Link>
      </div>
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'type', label: 'Type', render: (item) => <Badge variant="red">{String(item.type)}</Badge> },
          { key: 'target', label: 'Target' },
          { key: 'reporter', label: 'Reporter' },
          { key: 'status', label: 'Status', render: (item) => (
            <Badge variant={item.status === 'pending' ? 'amber' : 'default'}>{String(item.status)}</Badge>
          )},
          { key: 'createdAt', label: 'Date' },
        ]}
        data={demoReports}
      />
    </div>
  );
}
