"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { IconMoon, IconSun } from "@/components/ui/Icons";

export default function SettingsPage() {
  const { theme, setTheme, autoplay, setAutoplay, restrictedMode, setRestrictedMode, clearHistory } =
    useAppStore();

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 md:px-6 md:py-5">
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-text-muted">Preferences for this EyeBox demo (saved locally)</p>

      <section className="mt-6 space-y-1 rounded-2xl border border-border bg-bg-elevated p-2">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-bg-hover"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <span className="inline-flex items-center gap-3 font-medium">
            {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            Appearance
          </span>
          <span className="text-sm text-text-muted capitalize">{theme}</span>
        </button>

        <label className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-bg-hover">
          <span className="font-medium">Autoplay next video</span>
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => setAutoplay(e.target.checked)}
            className="accent-[var(--accent)]"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-bg-hover">
          <div>
            <p className="font-medium">Restricted Mode</p>
            <p className="text-xs text-text-muted">Hides live streams from home and explore (demo)</p>
          </div>
          <input
            type="checkbox"
            checked={restrictedMode}
            onChange={(e) => setRestrictedMode(e.target.checked)}
            className="accent-[var(--accent)]"
          />
        </label>
      </section>

      <section className="mt-4 space-y-1 rounded-2xl border border-border bg-bg-elevated p-2">
        <Link href="/history" className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-bg-hover">
          <span className="font-medium">Watch history</span>
          <span className="text-sm text-text-muted">Manage</span>
        </Link>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-bg-hover"
          onClick={() => {
            if (confirm("Clear all watch history on this device?")) clearHistory();
          }}
        >
          <span className="font-medium text-accent">Clear watch history</span>
        </button>
      </section>

      <p className="mt-6 text-xs text-text-dim">
        EyeBox is a front-end demo. Preferences persist in localStorage — no account sync.
      </p>
    </div>
  );
}
