"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { IconCheck, IconUpload } from "@/components/ui/Icons";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setDone(false);
    setProgress(0);
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(timer);
          setDone(true);
          return 100;
        }
        return p + 8;
      });
    }, 120);
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 md:px-6 md:py-5">
      <Link href="/studio" className="text-sm text-text-muted hover:text-text">
        ← Studio
      </Link>
      <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight">Upload</h1>
      <p className="mt-1 text-sm text-text-muted">Publish long-form, Shorts, or schedule a premiere</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-bg-elevated px-6 py-14 text-center transition hover:border-accent/50 hover:bg-bg-hover">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white">
            <IconUpload />
          </span>
          <div>
            <p className="font-semibold">{fileName ?? "Drag a file or click to browse"}</p>
            <p className="mt-1 text-sm text-text-muted">MP4, MOV, WebM up to 4GB (demo)</p>
          </div>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-bg-elevated px-3 outline-none focus:border-accent/50"
            placeholder="Add a title that works as a thumbnail headline"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-border bg-bg-elevated px-3 py-2 outline-none focus:border-accent/50"
            placeholder="Tell viewers what they’ll get. Add timestamps for chapters."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Visibility</label>
          <div className="flex flex-wrap gap-2">
            {["public", "unlisted", "private"].map((v) => (
              <button
                key={v}
                type="button"
                className="chip capitalize"
                data-active={visibility === v}
                onClick={() => setVisibility(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {progress > 0 && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-text-muted">
              <span>{done ? "Processing complete" : "Uploading…"}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-chip">
              <div className="progress-bar h-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {done && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
            <IconCheck size={16} /> Demo upload queued. In production this would transcode HLS/DASH variants.
          </div>
        )}

        <button type="submit" className="pill-btn" data-variant="accent">
          Publish
        </button>
      </form>
    </div>
  );
}
