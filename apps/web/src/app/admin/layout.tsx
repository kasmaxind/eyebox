import Link from 'next/link';
import { Shield, Users, Video, Tv, Flag, BarChart3, Megaphone, Settings } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { ADMIN_NAV } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  Shield, Users, Video, Tv, Flag, BarChart3, Megaphone, Settings,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen atmospheric-bg">
      <aside className="hidden md:flex flex-col w-60 border-r border-glass-border bg-void-50/80 backdrop-blur-xl">
        <div className="p-4 border-b border-glass-border">
          <Logo size="sm" />
          <div className="flex items-center gap-2 mt-2">
            <Shield size={14} className="text-red-400" />
            <p className="text-xs text-red-400 font-medium">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {ADMIN_NAV.map((item) => {
            const Icon = iconMap[item.icon] || Shield;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-glass-hover transition-all text-sm"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-glass-border">
          <Link href="/home" className="text-sm text-cyan hover:text-cyan-dim">← Back to EYEBOX</Link>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
