import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchVideosBatch } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";
import { removeFromPlaylist } from "../lib/library.js";
import { useLibrary } from "../hooks/useLibrary.js";

export default function PlaylistDetail() {
  const { id } = useParams();
  const lib = useLibrary();
  const playlist = lib.playlists.find((p) => p.id === id);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!playlist?.videoIds?.length) {
      setVideos([]);
      return;
    }
    fetchVideosBatch(playlist.videoIds).then((d) => {
      const byId = new Map((d.videos || []).map((v) => [v.id, v]));
      setVideos(playlist.videoIds.map((vid) => byId.get(vid)).filter(Boolean));
    });
  }, [id, lib.playlists, playlist?.videoIds]);

  if (!playlist) {
    return (
      <main className="page">
        <div className="error">Playlist not found. <Link to="/playlists">Back</Link></div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-hero">
        <div>
          <Link to="/playlists" className="breadcrumb">← Playlists</Link>
          <h1>{playlist.name}</h1>
          <p>{videos.length} videos</p>
        </div>
      </div>
      <div className="video-grid">
        {videos.map((v) => (
          <div key={v.id} className="library-card-wrap">
            <VideoCard video={v} />
            <button
              type="button"
              className="btn btn-ghost library-remove"
              onClick={() => removeFromPlaylist(id, v.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
