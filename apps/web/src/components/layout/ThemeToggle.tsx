'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { setTheme } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) {
      dispatch(setTheme(saved));
    }
  }, [dispatch]);

  return (
    <button
      onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
      className={cn(
        'p-2 rounded-xl bg-glass border border-glass-border backdrop-blur-sm',
        'text-white/70 hover:text-white hover:bg-glass-hover transition-all',
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
