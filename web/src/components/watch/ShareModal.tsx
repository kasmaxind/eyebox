"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/format";
import { IconCheck, IconClose, IconShare } from "@/components/ui/Icons";

export function ShareModal({
  open,
  onClose,
  title,
  url,
  currentTime = 0,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  currentTime?: number;
}) {
  const [withTime, setWithTime] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const shareUrl = withTime && currentTime > 0 ? `${url}${url.includes("?") ? "&" : "?"}t=${Math.floor(currentTime)}` : url;

  async function copy() {
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        /* cancelled */
      }
    } else {
      await copy();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="scale-in w-full max-w-md rounded-2xl border border-border bg-bg-elevated p-5 shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">Share</h2>
          <button type="button" className="icon-btn h-9 w-9" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-text-muted">{title}</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="h-11 flex-1 rounded-xl border border-border bg-bg px-3 text-sm outline-none"
          />
          <button type="button" className="pill-btn" data-variant="accent" onClick={copy}>
            {copied ? <IconCheck size={16} /> : null}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={withTime}
            onChange={(e) => setWithTime(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Start at {formatDuration(currentTime)}
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="pill-btn" onClick={nativeShare}>
            <IconShare size={16} /> Share via…
          </button>
          <button
            type="button"
            className="pill-btn"
            onClick={async () => {
              const embed = `<iframe width="560" height="315" src="${shareUrl}" title="${title}" allowfullscreen></iframe>`;
              await navigator.clipboard?.writeText(embed);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
          >
            Copy embed
          </button>
        </div>
      </div>
    </div>
  );
}
