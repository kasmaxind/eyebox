'use client';

import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import { demoStudioContent } from '@/lib/demoData';
import { formatViews } from '@/lib/utils';

export default function AdminVideosPage() {
  const videos = demoStudioContent.map((v) => ({
    id: v.id,
    title: v.title,
    views: formatViews(v.views),
    status: v.status,
    category: v.category,
  }));

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Videos</h1>
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title' },
          { key: 'views', label: 'Views' },
          { key: 'category', label: 'Category', render: (item) => <Badge>{String(item.category)}</Badge> },
          { key: 'status', label: 'Status', render: (item) => (
            <Badge variant={item.status === 'published' ? 'green' : 'amber'}>{String(item.status)}</Badge>
          )},
        ]}
        data={videos}
      />
    </div>
  );
}
