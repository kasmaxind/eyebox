'use client';

import Image from 'next/image';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatViews, formatRelativeTime } from '@/lib/utils';

interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  publishedAt: string;
  status: string;
}

interface ContentTableProps {
  items: ContentItem[];
}

export default function ContentTable({ items }: ContentTableProps) {
  const statusVariant = (status: string) => {
    if (status === 'published') return 'green' as const;
    if (status === 'processing') return 'amber' as const;
    return 'default' as const;
  };

  return (
    <div className="rounded-2xl border border-glass-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-glass-border bg-glass">
            <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">Video</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider hidden sm:table-cell">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider hidden md:table-cell">Views</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider hidden lg:table-cell">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-glass-border hover:bg-glass-hover transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0">
                    <Image src={item.thumbnail} alt="" fill className="object-cover" />
                  </div>
                  <p className="text-sm text-white font-medium line-clamp-2">{item.title}</p>
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-white/60 hidden md:table-cell">
                <span className="flex items-center gap-1"><Eye size={14} />{formatViews(item.views)}</span>
              </td>
              <td className="px-4 py-3 text-sm text-white/40 hidden lg:table-cell">
                {formatRelativeTime(item.publishedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-glass"><Edit size={16} /></button>
                  <button className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-glass"><Trash2 size={16} /></button>
                  <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-glass"><MoreHorizontal size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
