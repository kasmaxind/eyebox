"use client";

import { useMemo, useState } from "react";
import type { CaptionCue } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { IconClose, IconSearch } from "@/components/ui/Icons";

export function TranscriptPanel({
  cues,
  currentTime,
  onSeek,
  onClose,
}: {
  cues: CaptionCue[];
  currentTime: number;
  onSeek: (t: number) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return cues;
    return cues.filter((c) => c.text.toLowerCase().includes(needle));
  }, [cues, q]);

  return (
    <div className="slide-up mt-4 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold">Transcript</h3>
        <button type="button" className="icon-btn h-8 w-8" onClick={onClose} aria-label="Close transcript">
          <IconClose size={16} />
        </button>
      </div>
      <div className="relative border-b border-border px-4 py-2">
        <IconSearch size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search transcript"
          className="h-9 w-full rounded-full bg-bg pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-accent/40"
        />
      </div>
      <ul className="max-h-72 overflow-y-auto scrollbar-thin p-2">
        {filtered.map((c, i) => {
          const active = currentTime >= c.start && currentTime <= c.end;
          return (
            <li key={`${c.start}-${i}`}>
              <button
                type="button"
                className={`flex w-full gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-bg-hover ${active ? "bg-accent-soft" : ""}`}
                onClick={() => onSeek(c.start)}
              >
                <span className="w-12 shrink-0 tabular-nums text-accent">{formatDuration(c.start)}</span>
                <span className="text-text-muted">{c.text}</span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-text-muted">No matching lines.</li>
        )}
      </ul>
    </div>
  );
}
