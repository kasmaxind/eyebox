"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { VideoCard } from "@/components/VideoCard";
import type { Playlist, Video } from "@/lib/types";

export default function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/playlists/${id}`);
      if (!res.ok) {
        setError("Playlist not found");
        return;
      }
      const data = (await res.json()) as {
        playlist: Playlist;
        videos: Video[];
      };
      setPlaylist(data.playlist);
      setVideos(data.videos);
    })();
  }, [id]);

  async function removeVideo(videoId: string) {
    const res = await fetch(`/api/playlists/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, action: "remove" }),
    });
    if (res.ok) {
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              videoIds: prev.videoIds.filter((v) => v !== videoId),
            }
          : prev
      );
    }
  }

  if (error) {
    return (
      <header className="page-head">
        <h1>Playlist</h1>
        <p>{error}</p>
        <p>
          <Link href="/playlists">Back to playlists</Link>
        </p>
      </header>
    );
  }

  if (!playlist) {
    return (
      <header className="page-head">
        <h1>Playlist</h1>
        <p>Loading…</p>
      </header>
    );
  }

  return (
    <>
      <header className="page-head">
        <p style={{ margin: 0 }}>
          <Link href="/playlists">Playlists</Link>
        </p>
        <h1>{playlist.name}</h1>
        <p>{playlist.description || `${playlist.videoIds.length} videos`}</p>
      </header>

      {videos.length === 0 ? (
        <p className="empty">
          This playlist is empty. Open a video and use “Add to playlist”.
        </p>
      ) : (
        <div className="rail-grid">
          {videos.map((video, i) => (
            <div key={video.id}>
              <VideoCard video={video} index={i} />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: "0.55rem" }}
                onClick={() => void removeVideo(video.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
