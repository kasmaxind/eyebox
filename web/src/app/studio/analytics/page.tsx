"use client";

import Link from "next/link";
import { IconSparkles } from "@/components/ui/Icons";

const rows = [
  { day: "Mon", views: 42 },
  { day: "Tue", views: 55 },
  { day: "Wed", views: 38 },
  { day: "Thu", views: 70 },
  { day: "Fri", views: 64 },
  { day: "Sat", views: 88 },
  { day: "Sun", views: 76 },
];

export default function AnalyticsPage() {
  const max = Math.max(...rows.map((r) => r.views));

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <Link href="/studio" className="text-sm text-text-muted hover:text-text">
        ← Studio
      </Link>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent">
          <IconSparkles />
        </span>
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-text-muted">Realtime reach, retention, and audience signals</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-bg-elevated p-5">
        <p className="mb-4 text-sm font-semibold">Views · last 7 days</p>
        <div className="flex h-48 items-end gap-3">
          {rows.map((r) => (
            <div key={r.day} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-accent to-rose-300 transition-all"
                style={{ height: `${(r.views / max) * 100}%` }}
                title={`${r.views}k`}
              />
              <span className="text-xs text-text-dim">{r.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          { title: "Avg. view duration", value: "4:18", note: "Top quartile for your niche" },
          { title: "Click-through rate", value: "8.4%", note: "Thumbnails performing well" },
          { title: "Returning viewers", value: "36%", note: "Up 3 pts vs last month" },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-bg-elevated p-4">
            <p className="text-xs text-text-dim">{c.title}</p>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-2xl font-semibold">{c.value}</p>
            <p className="mt-1 text-xs text-text-muted">{c.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
