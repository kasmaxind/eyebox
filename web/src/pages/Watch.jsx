import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchVideo,
  formatDuration,
  formatViews,
  likeVideo,
  postComment,
  timeAgo,
} from "../api.js";

export default function Watch() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetchVideo(id)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLikes(d.video.likes);
        setComments(d.comments || []);
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

  if (loading) return <main className="page"><div className="loading">Opening stream…</div></main>;
  if (error && !data) return <main className="page"><div className="error">{error}</div></main>;
  if (!data) return null;

  const { video, related } = data;

  return (
    <main className="page">
      <div className="watch-layout">
        <section>
          <div className="player-shell">
            <video
              key={video.id}
              src={video.streamUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
            />
          </div>

          <div className="watch-info">
            <h1>{video.title}</h1>
            <div className="watch-stats">
              {formatViews(video.views)} views · {timeAgo(video.createdAt)} · {video.category}
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

        <aside className="related">
          <h2>Up next</h2>
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
      </div>
    </main>
  );
}
