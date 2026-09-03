"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Playlist } from "@/lib/types";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/playlists");
    const data = (await res.json()) as { playlists: Playlist[] };
    setPlaylists(data.playlists);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setName("");
      setDescription("");
      await load();
    }
  }

  async function onDelete(id: string) {
    await fetch(`/api/playlists?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await load();
  }

  return (
    <>
      <header className="page-head">
        <h1>Playlists</h1>
        <p>Build sets of music videos for drives, focus, or late nights.</p>
      </header>

      <div className="page-panel">
        <form className="form-row" onSubmit={(e) => void onCreate(e)}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            aria-label="Playlist name"
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            aria-label="Playlist description"
          />
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </form>

        {loading ? (
          <p className="empty">Loading playlists…</p>
        ) : playlists.length === 0 ? (
          <p className="empty">No playlists yet — create your first one.</p>
        ) : (
          <div className="playlist-list">
            {playlists.map((pl) => (
              <div key={pl.id} className="playlist-item">
                <div>
                  <h3>
                    <Link href={`/playlists/${pl.id}`}>{pl.name}</Link>
                  </h3>
                  <p>
                    {pl.videoIds.length} videos
                    {pl.description ? ` · ${pl.description}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void onDelete(pl.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
