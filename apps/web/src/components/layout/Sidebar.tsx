'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Home, Zap, Users, TrendingUp, Radio, History, Clock, ThumbsUp,
  Download, Library, Music, Gamepad2, Film, GraduationCap, Trophy,
  Newspaper, LayoutDashboard, Shield, ChevronLeft, Upload, Crown,
} from 'lucide-react';
import Logo from './Logo';
import { toggleSidebar } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';
import { SIDEBAR_NAV, LIBRARY_NAV, CATEGORIES } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  Home, Zap, Users, TrendingUp, Radio, History, Clock, ThumbsUp,
  Download, Library, Music, Gamepad2, Film, GraduationCap, Trophy,
  Newspaper, LayoutDashboard, Shield, Upload, Crown,
};

function NavItem({ href, label, icon, collapsed }: { href: string; label: string; icon: string; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');
  const Icon = iconMap[icon] || Home;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
        isActive
          ? 'bg-cyan/10 text-cyan border border-cyan/20'
          : 'text-white/60 hover:text-white hover:bg-glass-hover'
      )}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
    </Link>
  );
}

function NavSection({ title, collapsed }: { title: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-px bg-glass-border my-2" />;
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
      {title}
    </p>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-void-50/80 border-r border-glass-border backdrop-blur-xl z-30"
    >
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        {!collapsed && <Logo size="sm" />}
        {collapsed && <Logo size="sm" href="/home" className="mx-auto" />}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            'p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-glass-hover transition-colors',
            collapsed && 'hidden'
          )}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
        {SIDEBAR_NAV.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}

        <NavSection title="Library" collapsed={collapsed} />
        {LIBRARY_NAV.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}

        <NavSection title="Explore" collapsed={collapsed} />
        {CATEGORIES.map((cat) => (
          <NavItem
            key={cat.id}
            href={`/${cat.id}`}
            label={cat.label}
            icon={cat.icon}
            collapsed={collapsed}
          />
        ))}

        <NavSection title="Creator" collapsed={collapsed} />
        <NavItem href="/upload" label="Upload" icon="Upload" collapsed={collapsed} />
        <NavItem href="/studio" label="Studio" icon="LayoutDashboard" collapsed={collapsed} />
        <NavItem href="/premium" label="Premium" icon="Crown" collapsed={collapsed} />

        {user?.role === 'admin' && (
          <>
            <NavSection title="Admin" collapsed={collapsed} />
            <NavItem href="/admin" label="Admin Panel" icon="Shield" collapsed={collapsed} />
          </>
        )}
      </nav>
    </motion.aside>
  );
}
