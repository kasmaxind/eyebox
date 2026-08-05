"use client";

import Link from "next/link";
import { videos } from "@/data/videos";
import { formatViews } from "@/lib/format";
import { IconSparkles, IconUpload } from "@/components/ui/Icons";

const stats = [
  { label: "Views (28d)", value: "1.28M", delta: "+12.4%" },
  { label: "Watch time (hrs)", value: "48.2K", delta: "+8.1%" },
  { label: "Subscribers", value: "24.6K", delta: "+640" },
  { label: "Revenue est.", value: "$3,420", delta: "+5.2%" },
];

export default function StudioPage() {
  const mine = videos.slice(0, 6);

  return (
    <div className="px-3 py-4 md:px-6 md:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight">
            Creator Studio
          </h1>
          <p className="mt-1 text-sm text-text-muted">Upload, measure, and grow your channel</p>
        </div>
        <div className="flex gap-2">
          <Link href="/studio/analytics" className="pill-btn">
            <IconSparkles size={16} /> Analytics
          </Link>
          <Link href="/studio/upload" className="pill-btn" data-variant="accent">
            <IconUpload size={16} /> Upload
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-bg-elevated p-4">
            <p className="text-xs text-text-dim">{s.label}</p>
            <p className="mt-2 font-[family-name:var(--font-outfit)] text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-emerald-400">{s.delta}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Channel content</h2>
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Video</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Visibility</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Likes</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((v) => (
                <tr key={v.id} className="border-t border-border/80 hover:bg-bg-hover/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.thumbnail} alt="" className="h-12 w-20 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <Link href={`/watch/${v.id}`} className="line-clamp-1 font-medium hover:underline">
                          {v.title}
                        </Link>
                        <p className="text-xs text-text-dim">{v.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-text-muted sm:table-cell">Public</td>
                  <td className="px-4 py-3 tabular-nums">{formatViews(v.views)}</td>
                  <td className="hidden px-4 py-3 tabular-nums md:table-cell">{formatViews(v.likes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
