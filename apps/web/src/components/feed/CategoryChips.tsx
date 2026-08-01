'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

export default function CategoryChips() {
  const pathname = usePathname();

  const chips = [
    { id: 'all', label: 'All', href: '/home' },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, href: `/${c.id}` })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
      {chips.map((chip) => {
        const isActive = pathname === chip.href;
        return (
          <Link
            key={chip.id}
            href={chip.href}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              isActive
                ? 'bg-cyan text-void'
                : 'bg-glass border border-glass-border text-white/70 hover:text-white hover:bg-glass-hover'
            )}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
