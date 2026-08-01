'use client';

import Link from 'next/link';
import { ChevronRight, BadgeCheck } from 'lucide-react';
import type { Channel } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { formatViews } from '@/lib/utils';

interface CreatorRowProps {
  creators: Channel[];
}

export default function CreatorRow({ creators }: CreatorRowProps) {
  if (!creators.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Popular Creators</h2>
        <Link href="/subscriptions" className="text-sm text-cyan hover:text-cyan-dim flex items-center gap-1">
          See all <ChevronRight size={16} />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {creators.map((creator) => (
          <Link
            key={creator.id}
            href={`/channel/${creator.handle}`}
            className="flex flex-col items-center gap-2 w-28 shrink-0 group"
          >
            <Avatar src={creator.avatar} name={creator.name} size="lg" className="group-hover:ring-cyan/50 transition-all" />
            <div className="text-center">
              <p className="text-sm font-medium text-white truncate w-28 flex items-center justify-center gap-1">
                {creator.name}
                {creator.isVerified && <BadgeCheck size={14} className="text-cyan shrink-0" />}
              </p>
              <p className="text-xs text-white/40">{formatViews(creator.subscriberCount)} subs</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
