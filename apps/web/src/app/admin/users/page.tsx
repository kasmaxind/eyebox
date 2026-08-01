'use client';

import DataTable from '@/components/admin/DataTable';
import Badge from '@/components/ui/Badge';
import { demoAdminUsers } from '@/lib/demoData';

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Users</h1>
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (item) => <Badge variant="cyan">{String(item.role)}</Badge> },
          { key: 'status', label: 'Status', render: (item) => (
            <Badge variant={item.status === 'active' ? 'green' : 'red'}>{String(item.status)}</Badge>
          )},
          { key: 'joined', label: 'Joined' },
        ]}
        data={demoAdminUsers}
      />
    </div>
  );
}
