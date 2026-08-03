"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import { channels } from "@/data/channels";
import { cn, formatViews } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import {
  IconClock,
  IconHistory,
  IconHome,
  IconLibrary,
  IconLike,
  IconLive,
  IconPlaylist,
  IconShorts,
  IconStudio,
  IconSubs,
  IconTrending,
} from "@/components/ui/Icons";

const mainNav = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/shorts", label: "Shorts", icon: IconShorts },
  { href: "/subscriptions", label: "Subscriptions", icon: IconSubs },
];

const libraryNav = [
  { href: "/library", label: "Library", icon: IconLibrary },
  { href: "/history", label: "History", icon: IconHistory },
  { href: "/watch-later", label: "Watch later", icon: IconClock },
  { href: "/liked", label: "Liked videos", icon: IconLike },
];

const exploreNav = [
  { href: "/trending", label: "Trending", icon: IconTrending },
  { href: "/live", label: "Live", icon: IconLive },
  { href: "/studio", label: "Studio", icon: IconStudio },
];

function NavItem({
  href,
  label,
  icon: Icon,
  collapsed,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-xl px-3 py-2.5 text-sm transition-colors",
        collapsed && "justify-center px-0",
        active ? "bg-bg-hover font-semibold text-text" : "text-text-muted hover:bg-bg-hover hover:text-text",
      )}
      title={label}
    >
      <Icon size={22} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, subscribed } = useAppStore();
  const subs = channels.filter((c) => subscribed.has(c.id)).slice(0, 6);

  return (
    <aside
      className={cn(
        "fixed left-0 top-[var(--topbar-h)] z-30 hidden h-[calc(100vh-var(--topbar-h))] overflow-y-auto border-r border-border/60 bg-bg/80 px-2 py-3 backdrop-blur-md scrollbar-thin md:block",
        sidebarCollapsed ? "w-[var(--sidebar-collapsed-w)]" : "w-[var(--sidebar-w)]",
      )}
    >
      <nav className="flex flex-col gap-0.5">
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {!sidebarCollapsed && <div className="my-3 h-px bg-border/80" />}

      <nav className="flex flex-col gap-0.5">
        {libraryNav.map((item) => (
          <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} />
        ))}
        {!sidebarCollapsed && (
          <Link
            href="/playlist/pl-focus"
            className="flex items-center gap-4 rounded-xl px-3 py-2.5 text-sm text-text-muted hover:bg-bg-hover hover:text-text"
          >
            <IconPlaylist size={22} />
            <span>Deep work focus</span>
          </Link>
        )}
      </nav>

      {!sidebarCollapsed && <div className="my-3 h-px bg-border/80" />}

      <nav className="flex flex-col gap-0.5">
        {exploreNav.map((item) => (
          <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {!sidebarCollapsed && (
        <>
          <div className="my-3 h-px bg-border/80" />
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-text-dim">Subscriptions</p>
          <div className="flex flex-col gap-0.5">
            {subs.map((c) => (
              <Link
                key={c.id}
                href={`/channel/${c.handle}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>
          <p className="mt-6 px-3 text-[11px] leading-relaxed text-text-dim">
            © {new Date().getFullYear()} EyeBox · {formatViews(128000000)} creators building on the open feed
          </p>
        </>
      )}
    </aside>
  );
}
