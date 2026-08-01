'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Bell, Upload, MessageCircle, Users, Radio, Settings } from 'lucide-react';
import api, { safeApiCall } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { demoNotifications } from '@/lib/demoData';
import { formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  upload: Upload,
  comment: MessageCircle,
  like: Bell,
  subscribe: Users,
  live: Radio,
  system: Settings,
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Notification[]>('/notifications');
        return data;
      }, demoNotifications),
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Notifications</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-glass animate-pulse" />
          ))}
        </div>
      ) : notifications?.length ? (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <Link
                key={notif.id}
                href={notif.link || '#'}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                  notif.read ? 'bg-glass hover:bg-glass-hover' : 'bg-cyan/5 border border-cyan/10 hover:border-cyan/20'
                }`}
              >
                <div className={`p-2 rounded-lg ${notif.read ? 'bg-glass' : 'bg-cyan/10'}`}>
                  <Icon size={18} className={notif.read ? 'text-white/40' : 'text-cyan'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notif.read ? 'text-white/70' : 'text-white'}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-white/40 mt-0.5 truncate">{notif.message}</p>
                  <p className="text-xs text-white/25 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                </div>
                {!notif.read && <span className="w-2 h-2 rounded-full bg-cyan shrink-0 mt-2" />}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bell size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No notifications yet</p>
        </div>
      )}
    </div>
  );
}
