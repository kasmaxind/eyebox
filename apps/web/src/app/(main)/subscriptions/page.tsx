'use client';

import Link from 'next/link';
import { useLibrary } from '@/lib/hooks/useFeed';
import Avatar from '@/components/ui/Avatar';
import { formatViews } from '@/lib/utils';
import { demoCreators } from '@/lib/demoData';
import { VideoGridSkeleton } from '@/components/ui/Skeleton';

export default function SubscriptionsPage() {
  const { isLoading } = useLibrary('subscriptions');
  const subscriptions = demoCreators.filter((c) => c.isSubscribed);

  return (
    <div>
      <h1 className="text-2xl font-orbitron font-bold text-white mb-6">Subscriptions</h1>
      {isLoading ? (
        <VideoGridSkeleton count={4} />
      ) : subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((channel) => (
            <Link
              key={channel.id}
              href={`/channel/${channel.handle}`}
              className="flex items-center gap-4 p-4 rounded-2xl glass-panel hover:border-cyan/20 transition-all"
            >
              <Avatar src={channel.avatar} name={channel.name} size="lg" />
              <div>
                <p className="font-semibold text-white">{channel.name}</p>
                <p className="text-sm text-white/50">{formatViews(channel.subscriberCount)} subscribers</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg">No subscriptions yet</p>
          <p className="text-white/25 text-sm mt-2">Subscribe to channels to see their latest videos here</p>
        </div>
      )}
    </div>
  );
}
