"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { playlists as seedPlaylists } from "@/data/content";
import { IconCheck, IconClose, IconPlus } from "@/components/ui/Icons";

export function SaveModal({
  open,
  onClose,
  videoId,
}: {
  open: boolean;
  onClose: () => void;
  videoId: string;
}) {
  const { watchLater, toggleWatchLater, customPlaylists, createPlaylist, addToPlaylist } = useAppStore();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="scale-in w-full max-w-sm rounded-2xl border border-border bg-bg-elevated p-5 shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">Save to…</h2>
          <button type="button" className="icon-btn h-9 w-9" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>

        <label className="mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-bg-hover">
          <input
            type="checkbox"
            checked={watchLater.has(videoId)}
            onChange={() => toggleWatchLater(videoId)}
            className="accent-[var(--accent)]"
          />
          <span className="text-sm font-medium">Watch later</span>
        </label>

        <ul className="mb-3 max-h-48 space-y-1 overflow-y-auto scrollbar-thin">
          {customPlaylists.map((p) => {
            const has = p.videoIds.includes(videoId);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm hover:bg-bg-hover"
                  onClick={() => {
                    if (!has) addToPlaylist(p.id, videoId);
                  }}
                >
                  <span className="grid h-5 w-5 place-items-center rounded border border-border">
                    {has ? <IconCheck size={14} /> : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
                  <span className="text-xs text-text-dim">{p.visibility}</span>
                </button>
              </li>
            );
          })}
          {seedPlaylists.map((p) => (
            <li key={p.id}>
              <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-text-muted">
                <span className="grid h-5 w-5 place-items-center rounded border border-border opacity-50" />
                <span className="min-w-0 flex-1 truncate">{p.title}</span>
                <span className="text-xs">demo</span>
              </div>
            </li>
          ))}
        </ul>

        {creating ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              createPlaylist(name.trim(), videoId);
              setName("");
              setCreating(false);
            }}
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist name"
              className="h-10 flex-1 rounded-xl border border-border bg-bg px-3 text-sm outline-none focus:border-accent/50"
            />
            <button type="submit" className="pill-btn" data-variant="accent">
              Create
            </button>
          </form>
        ) : (
          <button type="button" className="pill-btn w-full" onClick={() => setCreating(true)}>
            <IconPlus size={16} /> New playlist
          </button>
        )}
        <p className="mt-3 text-xs text-text-dim">Playlists are saved locally on this device.</p>
      </div>
    </div>
  );
}
