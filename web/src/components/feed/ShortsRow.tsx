"use client";

import Link from "next/link";
import { shorts } from "@/data/videos";
import { formatViews } from "@/lib/format";
import { IconShorts } from "@/components/ui/Icons";

export function ShortsRow() {
  return (
    <section className="mb-8 fade-in">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            <IconShorts size={18} />
          </span>
          <div>
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold tracking-tight">Shorts</h2>
            <p className="text-sm text-text-muted">Vertical clips trending now</p>
          </div>
        </div>
        <Link href="/shorts" className="text-sm font-medium text-text-muted hover:text-text">
          Open feed
        </Link>
      </div>
      <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
        {shorts.map((s) => (
          <Link
            key={s.id}
            href={`/shorts?v=${s.id}`}
            className="group relative w-36 shrink-0 overflow-hidden rounded-2xl bg-bg-chip sm:w-40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.thumbnail}
              alt=""
              className="aspect-[9/16] w-full object-cover transition duration-400 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5">
              <p className="line-clamp-2 text-xs font-semibold leading-snug">{s.title}</p>
              <p className="mt-1 text-[11px] text-white/70">{formatViews(s.views)} views</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
