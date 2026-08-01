import Link from 'next/link';
import { LayoutDashboard, BarChart3, Video, MessageSquare, DollarSign, Palette, Radio } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { STUDIO_NAV } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, BarChart3, Video, MessageSquare, DollarSign, Palette, Radio,
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen atmospheric-bg">
      <aside className="hidden md:flex flex-col w-60 border-r border-glass-border bg-void-50/80 backdrop-blur-xl">
        <div className="p-4 border-b border-glass-border">
          <Logo size="sm" />
          <p className="text-xs text-white/40 mt-2 font-medium">Creator Studio</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {STUDIO_NAV.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
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
          <Link href="/home" className="text-sm text-cyan hover:text-cyan-dim">
            ← Back to EYEBOX
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
