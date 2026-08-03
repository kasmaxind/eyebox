"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/format";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen">
      <TopBar />
      <Sidebar />
      <main
        className={cn(
          "min-h-screen pt-[var(--topbar-h)] pb-16 transition-[padding] duration-200 md:pb-0",
          sidebarCollapsed ? "md:pl-[var(--sidebar-collapsed-w)]" : "md:pl-[var(--sidebar-w)]",
        )}
      >
        {children}
      </main>
      <MobileNav />
      <MiniPlayer />
    </div>
  );
}
