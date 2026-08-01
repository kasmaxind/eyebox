'use client';

import Image from 'next/image';
import { BadgeCheck, Bell } from 'lucide-react';
import type { Channel } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatViews } from '@/lib/utils';

interface ChannelHeaderProps {
  channel: Channel;
}

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
  return (
    <div className="relative">
      <div className="h-32 sm:h-48 rounded-2xl overflow-hidden bg-void-200">
        {channel.banner && (
          <Image src={channel.banner} alt="" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 px-4 relative z-10">
        <Avatar src={channel.avatar} name={channel.name} size="xl" className="ring-4 ring-void" />
        <div className="flex-1 pb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{channel.name}</h1>
            {channel.isVerified && <BadgeCheck size={22} className="text-cyan" />}
          </div>
          <p className="text-sm text-white/50 mt-1">
            @{channel.handle} · {formatViews(channel.subscriberCount)} subscribers · {channel.videoCount} videos
          </p>
          {channel.description && (
            <p className="text-sm text-white/60 mt-2 max-w-2xl line-clamp-2">{channel.description}</p>
          )}
        </div>
        <div className="flex gap-2 pb-2">
          <Button variant={channel.isSubscribed ? 'secondary' : 'primary'}>
            {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
          <Button variant="secondary" className="!px-3">
            <Bell size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
