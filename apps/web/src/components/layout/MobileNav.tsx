'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Zap, Search, Library, User } from 'lucide-react';
import { setMobileNavOpen } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/shorts', label: 'Shorts', icon: Zap },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.mobileNavOpen);
  const pathname = usePathname();

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-void-50/90 backdrop-blur-xl border-t border-glass-border">
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                  isActive ? 'text-cyan' : 'text-white/50'
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Slide-out menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-void/80 backdrop-blur-sm"
              onClick={() => dispatch(setMobileNavOpen(false))}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-void-50 border-r border-glass-border p-4 overflow-y-auto"
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => dispatch(setMobileNavOpen(false))}
                  className="p-2 rounded-lg text-white/50 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-1">
                {[
                  { href: '/home', label: 'Home' },
                  { href: '/trending', label: 'Trending' },
                  { href: '/shorts', label: 'Shorts' },
                  { href: '/live', label: 'Live' },
                  { href: '/subscriptions', label: 'Subscriptions' },
                  { href: '/history', label: 'History' },
                  { href: '/watch-later', label: 'Watch Later' },
                  { href: '/liked', label: 'Liked' },
                  { href: '/upload', label: 'Upload' },
                  { href: '/studio', label: 'Studio' },
                  { href: '/premium', label: 'Premium' },
                  { href: '/settings', label: 'Settings' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => dispatch(setMobileNavOpen(false))}
                    className="block px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-glass-hover text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
