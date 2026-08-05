"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconLibrary, IconShorts, IconSubs, IconStudio } from "@/components/ui/Icons";
import { cn } from "@/lib/format";

const items = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/shorts", label: "Shorts", icon: IconShorts },
  { href: "/subscriptions", label: "Subs", icon: IconSubs },
  { href: "/library", label: "Library", icon: IconLibrary },
  { href: "/studio", label: "Studio", icon: IconStudio },
];

export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/watch") || pathname.startsWith("/shorts")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border/80 bg-bg/95 backdrop-blur-xl md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 text-[10px]",
              active ? "text-text" : "text-text-muted",
            )}
          >
            <Icon size={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
