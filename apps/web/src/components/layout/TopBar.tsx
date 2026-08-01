'use client';

import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Bell, Upload } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import SearchBar from '@/components/search/SearchBar';
import Avatar from '@/components/ui/Avatar';
import { setMobileNavOpen } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

export default function TopBar() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-void/60 backdrop-blur-xl border-b border-glass-border">
      <button
        onClick={() => dispatch(setMobileNavOpen(true))}
        className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-glass-hover"
      >
        <Menu size={22} />
      </button>

      <div className="md:hidden">
        <Logo size="sm" />
      </div>

      <div className="flex-1 max-w-2xl mx-auto hidden sm:block">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/upload"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-glass border border-glass-border text-white/70 hover:text-white hover:bg-glass-hover transition-all text-sm"
        >
          <Upload size={16} />
          Upload
        </Link>

        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-white/70 hover:text-white hover:bg-glass-hover transition-all"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan rounded-full" />
        </Link>

        <ThemeToggle />

        {user ? (
          <Link href="/profile">
            <Avatar src={user.avatar} name={user.name} size="sm" />
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-xl bg-cyan text-void text-sm font-semibold hover:bg-cyan-dim transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
