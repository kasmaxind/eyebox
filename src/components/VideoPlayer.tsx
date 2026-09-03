"use client";

import { useEffect, useRef, useState } from "react";
import type { Playlist, Video } from "@/lib/types";

export function VideoPlayer({
  video,
  favorites,
  playlists,
  onFavoriteChange,
}: {
  video: Video;
  favorites: string[];
  playlists: Playlist[];
  onFavoriteChange?: (favorites: string[]) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(favorites.includes(video.id));
  const [toast, setToast] = useState("");
  const [playlistOpen, setPlaylistOpen] = useState(false);

  useEffect(() => {
    setLiked(favorites.includes(video.id));
  }, [favorites, video.id]);

  useEffect(() => {
    void fetch(`/api/videos/${video.id}`, { method: "POST" });
  }, [video.id]);

  async function toggleFavorite() {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id }),
    });
    const data = (await res.json()) as { favorites: string[] };
    setLiked(data.favorites.includes(video.id));
    onFavoriteChange?.(data.favorites);
  }

  async function addToPlaylist(playlistId: string) {
    const res = await fetch(`/api/playlists/${playlistId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id, action: "add" }),
    });
    if (res.ok) {
      setToast("Added to playlist");
      setPlaylistOpen(false);
      window.setTimeout(() => setToast(""), 1800);
    }
  }

  return (
    <div className="player-shell">
      <div className="player-stage">
        <video
          ref={ref}
          key={video.id}
          className="player-video"
          controls
          autoPlay
          playsInline
          poster={video.posterUrl}
          src={video.videoUrl}
        />
      </div>

      <div className="player-meta">
        <div>
          <p className="player-artist">{video.artist}</p>
          <h1 className="player-title">{video.title}</h1>
          <p className="player-desc">{video.description}</p>
          <div className="player-tags">
            <span>{video.genre}</span>
            {video.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="player-actions">
          <button
            type="button"
            className={liked ? "btn btn-primary" : "btn btn-ghost"}
            onClick={() => void toggleFavorite()}
            aria-pressed={liked}
          >
            {liked ? "Saved" : "Save"}
          </button>
          <div className="playlist-menu">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPlaylistOpen((o) => !o)}
              aria-expanded={playlistOpen}
            >
              Add to playlist
            </button>
            {playlistOpen && (
              <ul className="playlist-menu__list" role="menu">
                {playlists.length === 0 && (
                  <li className="playlist-menu__empty">No playlists yet</li>
                )}
                {playlists.map((pl) => (
                  <li key={pl.id}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void addToPlaylist(pl.id)}
                    >
                      {pl.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
