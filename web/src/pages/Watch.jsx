import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchPlayback,
  fetchVideo,
  formatDuration,
  formatViews,
  likeVideo,
  postComment,
  timeAgo,
} from "../api.js";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { addToPlaylist, isWatchLater, recordWatch, toggleWatchLater } from "../lib/library.js";
import { useLibrary } from "../hooks/useLibrary.js";

export default function Watch() {
  const { id } = useParams();
  const { openMini } = usePlayer();
  const [data, setData] = useState(null);
  const [playback, setPlayback] = useState(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [savedLater, setSavedLater] = useState(false);
  const lib = useLibrary();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    Promise.all([fetchVideo(id), fetchPlayback(id)])
      .then(([d, pb]) => {
        if (!alive) return;
        setData(d);
        setPlayback(pb);
        setLikes(d.video.likes);
        setComments(d.comments || []);
        recordWatch(d.video, 0);
        setSavedLater(isWatchLater(d.video.id));
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  async function onLike() {
    try {
      const res = await likeVideo(id);
      setLikes(res.likes);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onComment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      const res = await postComment(id, { author, body });
      setComments((c) => [res.comment, ...c]);
      setBody("");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleMiniPlayer() {
    if (!data?.video) return;
    openMini({
      id: data.video.id,
      title: data.video.title,
      channel: data.video.channel.name,
      src: playback?.streamUrl || data.video.streamUrl,
      currentTime: 0,
      playing: true,
    });
  }

  function onWatchLater() {
    if (!data?.video) return;
    const added = toggleWatchLater(data.video);
    setSavedLater(added);
  }

  function onSavePlaylist(playlistId) {
    if (data?.video) addToPlaylist(playlistId, data.video);
  }

  if (loading) return <main className="page"><div className="loading">Opening stream…</div></main>;
  if (error && !data) return <main className="page"><div className="error">{error}</div></main>;
  if (!data) return null;

  const { video, related } = data;

  return (
    <main className={`page ${theaterMode ? "page-theater" : ""}`}>
      <div className={`watch-layout ${theaterMode ? "watch-theater" : ""}`}>
        <section>
          <div className="player-shell">
            <VideoPlayer
              video={video}
              playback={playback}
              theaterMode={theaterMode}
              onTheaterToggle={() => setTheaterMode((t) => !t)}
              onMiniPlayer={handleMiniPlayer}
            />
          </div>

          <div className="watch-info">
            <h1>{video.title}</h1>
            <div className="watch-stats">
              {formatViews(video.views)} views · {timeAgo(video.createdAt)} · {video.category}
              {playback?.adaptive && (
                <span className="playback-tag"> · Adaptive streaming</span>
              )}
            </div>

            <div className="channel-row">
              <Link to={`/channel/${video.channel.handle}`} className="channel-left">
                <div
                  className="avatar"
                  style={{ background: video.channel.avatarColor }}
                >
                  {video.channel.name.slice(0, 1)}
                </div>
                <div>
                  <strong>{video.channel.name}</strong>
                  <span>{formatViews(video.channel.subscribers)} subscribers</span>
                </div>
              </Link>
              <button type="button" className="btn btn-ghost" onClick={onLike}>
                ♥ {formatViews(likes)}
              </button>
              <button
                type="button"
                className={`btn btn-ghost ${savedLater ? "active-save" : ""}`}
                onClick={onWatchLater}
              >
                {savedLater ? "✓ Saved" : "Watch later"}
              </button>
              {lib.playlists.length > 0 && (
                <select
                  className="playlist-save-select"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) onSavePlaylist(e.target.value);
                    e.target.value = "";
                  }}
                  aria-label="Save to playlist"
                >
                  <option value="">Save to playlist…</option>
                  {lib.playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>{pl.name}</option>
                  ))}
                </select>
              )}
            </div>

            {video.description && (
              <div className="description-box">{video.description}</div>
            )}

            <div className="comments">
              <h2>{comments.length} Comments</h2>
              <form className="comment-form" onSubmit={onComment}>
                <input
                  placeholder="Display name (optional)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
                <textarea
                  rows={3}
                  placeholder="Add a comment…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
                <div>
                  <button className="btn btn-primary" type="submit">
                    Comment
                  </button>
                </div>
              </form>
              <div className="comment-list">
                {comments.map((c) => (
                  <div className="comment" key={c.id}>
                    <div
                      className="avatar"
                      style={{
                        width: 36,
                        height: 36,
                        background: "#2EE6A6",
                        fontSize: "0.75rem",
                      }}
                    >
                      {c.author.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="who">
                        {c.author}
                        <span className="when">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p>{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!theaterMode && (
          <aside className="related">
            <h2>
              Related videos
              {data.relatedPoweredBy && <span className="ai-tag">{data.relatedPoweredBy}</span>}
            </h2>
            {related.map((r) => (
              <Link key={r.id} to={`/watch/${r.id}`} className="related-item">
                <div className="thumb-wrap">
                  {r.thumbnailUrl ? (
                    <img src={r.thumbnailUrl} alt="" loading="lazy" />
                  ) : (
                    <div className="thumb-fallback" />
                  )}
                  <span className="duration">{formatDuration(r.duration)}</span>
                </div>
                <div>
                  <h3>{r.title}</h3>
                  <div className="sub">
                    {r.channel.name}
                    <br />
                    {formatViews(r.views)} views
                  </div>
                </div>
              </Link>
            ))}
          </aside>
        )}
      </div>
    </main>
  );
}
