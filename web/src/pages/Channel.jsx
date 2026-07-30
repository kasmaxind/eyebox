import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchChannel, formatViews } from "../api.js";
import VideoCard from "../components/VideoCard.jsx";

export default function Channel() {
  const { handle } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchChannel(handle)
      .then((d) => alive && setData(d))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [handle]);

  if (loading) return <main className="page"><div className="loading">Loading channel…</div></main>;
  if (error) return <main className="page"><div className="error">{error}</div></main>;
  if (!data) return null;

  const { channel, videos } = data;

  return (
    <main className="page">
      <div className="page-hero">
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div
            className="avatar"
            style={{
              width: 64,
              height: 64,
              fontSize: "1.4rem",
              background: channel.avatarColor,
            }}
          >
            {channel.name.slice(0, 1)}
          </div>
          <div>
            <h1>{channel.name}</h1>
            <p>
              @{channel.handle} · {formatViews(channel.subscribers)} subscribers ·{" "}
              {videos.length} videos
            </p>
          </div>
        </div>
      </div>
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </main>
  );
}
