'use client';

import Link from 'next/link';
import { Settings, Crown, LayoutDashboard, LogOut } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatRelativeTime } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-64 rounded-2xl bg-glass animate-pulse max-w-2xl mx-auto" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-8 rounded-2xl glass-panel text-center mb-6">
        <Avatar src={user?.avatar} name={user?.name || 'User'} size="xl" className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
        <p className="text-white/50 mt-1">{user?.email}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {user?.isPremium && <Badge variant="amber">Premium</Badge>}
          {user?.isVerified && <Badge variant="cyan">Verified</Badge>}
          <Badge>{user?.role}</Badge>
        </div>
        {user?.createdAt && (
          <p className="text-xs text-white/30 mt-3">Member since {formatRelativeTime(user.createdAt)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Link href="/settings" className="flex items-center gap-3 p-4 rounded-xl glass-panel hover:border-cyan/20 transition-all">
          <Settings size={20} className="text-white/50" />
          <span className="text-white">Settings</span>
        </Link>
        <Link href="/studio" className="flex items-center gap-3 p-4 rounded-xl glass-panel hover:border-cyan/20 transition-all">
          <LayoutDashboard size={20} className="text-white/50" />
          <span className="text-white">Creator Studio</span>
        </Link>
        <Link href="/premium" className="flex items-center gap-3 p-4 rounded-xl glass-panel hover:border-cyan/20 transition-all">
          <Crown size={20} className="text-amber" />
          <span className="text-white">Premium</span>
        </Link>
      </div>
    </div>
  );
}
