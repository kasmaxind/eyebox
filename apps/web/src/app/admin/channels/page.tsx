'use client';

import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import { demoCreators } from '@/lib/demoData';
import { formatViews } from '@/lib/utils';

export default function AdminChannelsPage() {
  const channels = demoCreators.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    subscribers: formatViews(c.subscriberCount),
    videos: c.videoCount,
    verified: c.isVerified ? 'Yes' : 'No',
  }));

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Channels</h1>
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'handle', label: 'Handle' },
          { key: 'subscribers', label: 'Subscribers' },
          { key: 'videos', label: 'Videos' },
          { key: 'verified', label: 'Verified', render: (item) => (
            <Badge variant={item.verified === 'Yes' ? 'cyan' : 'default'}>{String(item.verified)}</Badge>
          )},
        ]}
        data={channels}
      />
    </div>
  );
}
