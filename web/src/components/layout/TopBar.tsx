"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import {
  IconBell,
  IconClose,
  IconMenu,
  IconMic,
  IconSearch,
  IconUpload,
} from "@/components/ui/Icons";
import { notifications } from "@/data/content";
import { videos } from "@/data/videos";
import { cn, formatRelativeTime } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export function TopBar() {
  const router = useRouter();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    notificationsOpen,
    setNotificationsOpen,
  } = useAppStore();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos.slice(0, 5).map((v) => v.title);
    return videos
      .filter((v) => v.title.toLowerCase().includes(q) || v.tags.some((t) => t.includes(q)))
      .slice(0, 6)
      .map((v) => v.title);
  }, [query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setFocused(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [setNotificationsOpen]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--topbar-h)] items-center gap-3 border-b border-border/70 bg-bg/85 px-3 backdrop-blur-xl md:px-4">
      <div className="flex items-center gap-1">
        <button
          className="icon-btn"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <IconMenu />
        </button>
        <Logo />
      </div>

      <div className="mx-auto hidden w-full max-w-2xl flex-1 md:block" ref={wrapRef}>
        <form onSubmit={onSubmit} className="relative flex items-center gap-2">
          <div className="relative flex flex-1 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search EyeBox"
              className="h-11 w-full rounded-full border border-border bg-bg-elevated pl-5 pr-12 text-sm text-text outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="submit"
              className="absolute right-1.5 grid h-8 w-10 place-items-center rounded-full bg-bg-chip text-text-muted hover:text-text"
              aria-label="Search"
            >
              <IconSearch size={18} />
            </button>
          </div>
          <button type="button" className="icon-btn bg-bg-elevated" aria-label="Voice search" title="Voice search">
            <IconMic size={18} />
          </button>

          {focused && suggestions.length > 0 && (
            <div className="absolute left-0 right-14 top-12 z-50 scale-in overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[var(--shadow)]">
              <ul>
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-bg-hover"
                      onClick={() => {
                        setQuery(s);
                        setFocused(false);
                        router.push(`/search?q=${encodeURIComponent(s)}`);
                      }}
                    >
                      <IconSearch size={16} />
                      <span className="truncate">{s}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Link href="/search" className="icon-btn md:hidden" aria-label="Search">
          <IconSearch />
        </Link>
        <Link href="/studio/upload" className="icon-btn" aria-label="Create" title="Create">
          <IconUpload />
        </Link>
        <div className="relative">
          <button
            className="icon-btn relative"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <IconBell />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-[360px] max-w-[92vw] scale-in overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[var(--shadow)]">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="font-semibold">Notifications</p>
                <button className="icon-btn h-8 w-8" onClick={() => setNotificationsOpen(false)} aria-label="Close">
                  <IconClose size={16} />
                </button>
              </div>
              <ul className="max-h-[70vh] overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setNotificationsOpen(false)}
                      className={cn(
                        "flex gap-3 px-4 py-3 hover:bg-bg-hover",
                        !n.read && "bg-accent-soft/40",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={n.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                        <p className="truncate text-sm text-text-muted">{n.body}</p>
                        <p className="mt-1 text-xs text-text-dim">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                      {n.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.thumbnail} alt="" className="h-14 w-24 rounded-lg object-cover" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          className="ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-sm font-bold text-white"
          aria-label="Account"
          title="You"
        >
          E
        </button>
      </div>
    </header>
  );
}
