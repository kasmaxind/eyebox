'use client';

import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { demoReports } from '@/lib/demoData';

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Reports</h1>
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
          { key: 'actions', label: 'Actions', render: () => (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost">Review</Button>
              <Button size="sm" variant="danger">Dismiss</Button>
            </div>
          )},
        ]}
        data={demoReports}
      />
    </div>
  );
}
