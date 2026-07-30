import { Link } from "react-router-dom";
import { createPlaylist, deletePlaylist } from "../lib/library.js";
import { useLibrary } from "../hooks/useLibrary.js";
import { useState } from "react";

export default function Playlists() {
  const lib = useLibrary();
  const [name, setName] = useState("");

  function onCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name.trim());
    setName("");
  }

  return (
    <main className="page">
      <div className="page-hero">
        <h1>Playlists</h1>
        <p>Organize videos into collections</p>
      </div>

      <form className="playlist-create" onSubmit={onCreate}>
        <input
          placeholder="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Create</button>
      </form>

      {lib.playlists.length === 0 ? (
        <div className="empty">No playlists yet. Create one above.</div>
      ) : (
        <div className="playlist-grid">
          {lib.playlists.map((pl) => (
            <div key={pl.id} className="playlist-card">
              <Link to={`/playlists/${pl.id}`}>
                <div className="playlist-thumb">▶</div>
                <h3>{pl.name}</h3>
                <p>{pl.videoIds.length} videos</p>
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => deletePlaylist(pl.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
