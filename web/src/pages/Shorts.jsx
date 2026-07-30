import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchShorts } from "../api.js";
import { formatViews } from "../api.js";

export default function Shorts() {
  const [params] = useSearchParams();
  const startId = params.get("v");
  const [shorts, setShorts] = useState([]);
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchShorts(48).then((d) => {
      const list = d.videos || [];
      setShorts(list);
      if (startId) {
        const idx = list.findIndex((v) => v.id === startId);
        if (idx >= 0) setActive(idx);
      }
    });
  }, [startId]);

  useEffect(() => {
    const el = containerRef.current?.children[active];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active, shorts.length]);

  if (!shorts.length) {
    return <main className="page"><div className="loading">Loading Shorts…</div></main>;
  }

  const current = shorts[active];

  return (
    <main className="shorts-page">
      <div className="shorts-header">
        <Link to="/" className="btn btn-ghost">← Home</Link>
        <h1>Shorts</h1>
      </div>
      <div className="shorts-feed" ref={containerRef}>
        {shorts.map((v, i) => (
          <article
            key={v.id}
            className={`shorts-slide ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            <div className="shorts-player-wrap">
              <video
                src={v.streamUrl}
                poster={v.thumbnailUrl || undefined}
                playsInline
                loop
                muted={i !== active}
                autoPlay={i === active}
                controls={i === active}
              />
            </div>
            <div className="shorts-meta">
              <h2>{v.title}</h2>
              <p>@{v.channel?.handle} · {formatViews(v.views)} views</p>
              <Link to={`/watch/${v.id}`} className="btn btn-ghost shorts-watch-full">
                Watch full
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="shorts-nav">
        <button type="button" disabled={active <= 0} onClick={() => setActive((a) => a - 1)}>↑</button>
        <span>{active + 1} / {shorts.length}</span>
        <button type="button" disabled={active >= shorts.length - 1} onClick={() => setActive((a) => a + 1)}>↓</button>
      </div>
    </main>
  );
}
