import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Link } from "react-router-dom";
import { formatDuration } from "../api.js";
import { usePlayer } from "../context/PlayerContext.jsx";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(s) {
  if (!Number.isFinite(s)) return "0:00";
  const sec = Math.floor(s % 60);
  const min = Math.floor((s / 60) % 60);
  const hr = Math.floor(s / 3600);
  if (hr > 0) return `${hr}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export default function VideoPlayer({
  video,
  playback,
  theaterMode,
  onTheaterToggle,
  onMiniPlayer,
}) {
  const videoRef = useRef(null);
  const shellRef = useRef(null);
  const hlsRef = useRef(null);
  const hideTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [codec, setCodec] = useState("h264");
  const [subtitleId, setSubtitleId] = useState("off");
  const [audioId, setAudioId] = useState("default");
  const [hlsLevels, setHlsLevels] = useState([]);
  const [showControls, setShowControls] = useState(true);
  const [panel, setPanel] = useState(null);
  const [pipSupported] = useState(() => document.pictureInPictureEnabled);
  const [inPip, setInPip] = useState(false);

  const subtitles = playback?.subtitles || [];
  const renditions = playback?.renditions || [];
  const codecsAvailable = [...new Set(renditions.map((r) => r.codec))];

  const attachHls = useCallback(
    (url) => {
      const el = videoRef.current;
      if (!el || !url) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          startLevel: -1,
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(el);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setHlsLevels(
            hls.levels.map((lvl, i) => ({
              index: i,
              height: lvl.height,
              bitrate: lvl.bitrate,
              label: `${lvl.height}p`,
            }))
          );
        });
      } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = url;
      }
    },
    []
  );

  const attachProgressive = useCallback((url) => {
    const el = videoRef.current;
    if (!el) return;
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    el.src = url;
    setHlsLevels([]);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !playback) return;

    if (codec !== "h264") {
      const rend = renditions.find((r) => r.codec === codec && r.streamUrl);
      if (rend?.streamUrl) attachProgressive(rend.streamUrl);
      else if (playback.adaptive && playback.hlsUrl) attachHls(playback.hlsUrl);
      else attachProgressive(playback.streamUrl || video.streamUrl);
      return;
    }

    if (playback.adaptive && playback.hlsUrl) {
      attachHls(playback.hlsUrl);
    } else {
      attachProgressive(playback.streamUrl || video.streamUrl);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playback, video.streamUrl, codec, renditions, attachHls, attachProgressive]);

  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls || quality === "auto") {
      if (hls) hls.currentLevel = -1;
      return;
    }
    const level = hlsLevels.find((l) => l.label === quality);
    if (level) hls.currentLevel = level.index;
  }, [quality, hlsLevels]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const tracks = el.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      track.mode = track.dataset.subId === subtitleId ? "showing" : "hidden";
    }
  }, [subtitleId]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onTime = () => setCurrentTime(el.currentTime);
    const onMeta = () => setDuration(el.duration || video.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVol = () => {
      setVolume(el.volume);
      setMuted(el.muted);
    };
    const onEnterPip = () => setInPip(true);
    const onLeavePip = () => setInPip(false);

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("volumechange", onVol);
    el.addEventListener("enterpictureinpicture", onEnterPip);
    el.addEventListener("leavepictureinpicture", onLeavePip);

    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("volumechange", onVol);
      el.removeEventListener("enterpictureinpicture", onEnterPip);
      el.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  }, [video.duration]);

  function revealControls() {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2800);
  }

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  }

  function seek(e) {
    const el = videoRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    el.currentTime = pct * duration;
  }

  async function togglePip() {
    const el = videoRef.current;
    if (!el || !pipSupported) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await el.requestPictureInPicture();
    } catch {
      /* unsupported */
    }
  }

  async function toggleFullscreen() {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shell.requestFullscreen();
  }

  function selectAudio(trackId) {
    setAudioId(trackId);
    const hls = hlsRef.current;
    if (hls?.audioTracks?.length) {
      const idx = hls.audioTracks.findIndex((t) => String(t.id) === trackId);
      if (idx >= 0) hls.audioTrack = idx;
    }
    setPanel(null);
  }

  const qualityOptions = [
    { value: "auto", label: "Auto" },
    ...hlsLevels
      .slice()
      .sort((a, b) => b.height - a.height)
      .map((l) => ({ value: l.label, label: l.label })),
    ...renditions
      .filter((r) => r.codec === codec && !hlsLevels.some((l) => l.label === r.quality))
      .map((r) => ({ value: r.quality, label: `${r.quality}${r.hdr ? " HDR" : ""}` })),
  ];

  const uniqueQualities = [...new Map(qualityOptions.map((o) => [o.value, o])).values()];

  return (
    <div
      ref={shellRef}
      className={`vplayer ${theaterMode ? "theater" : ""} ${showControls ? "show-ui" : ""}`}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="vplayer-video"
        playsInline
        autoPlay
        preload="metadata"
        onClick={togglePlay}
      >
        {subtitles.map((s) => (
          <track
            key={s.id}
            kind="subtitles"
            src={s.url}
            srcLang={s.language}
            label={`${s.label}${s.kind === "auto" ? " (auto)" : ""}`}
            data-sub-id={s.id}
            default={false}
          />
        ))}
      </video>

      <div className="vplayer-badges">
        {playback?.hdr && <span className="vplayer-badge hdr">HDR</span>}
        {playback?.maxFps >= 60 && <span className="vplayer-badge">60 FPS</span>}
        {codec !== "h264" && <span className="vplayer-badge">{codec.toUpperCase()}</span>}
      </div>

      <div className="vplayer-gradient" />

      <div className="vplayer-bar">
        <div className="vplayer-progress" onClick={seek} role="slider" aria-valuenow={currentTime}>
          <div className="vplayer-progress-fill" style={{ width: `${(currentTime / duration) * 100 || 0}%` }} />
        </div>

        <div className="vplayer-controls">
          <div className="vplayer-left">
            <button type="button" className="vplayer-btn" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              className="vplayer-btn"
              onClick={() => {
                const el = videoRef.current;
                if (!el) return;
                el.muted = !el.muted;
              }}
              aria-label="Mute"
            >
              {muted || volume === 0 ? "🔇" : "🔊"}
            </button>
            <span className="vplayer-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="vplayer-right">
            {onMiniPlayer && (
              <button type="button" className="vplayer-btn" onClick={onMiniPlayer} title="Mini player" aria-label="Mini player">
                ⧉
              </button>
            )}
            <button type="button" className="vplayer-btn" onClick={onTheaterToggle} title="Theater mode" aria-label="Theater mode">
              ▭
            </button>
            {pipSupported && (
              <button type="button" className="vplayer-btn" onClick={togglePip} title="Picture-in-Picture" aria-label="Picture-in-Picture">
                {inPip ? "⧈" : "◧"}
              </button>
            )}
            <button type="button" className="vplayer-btn" onClick={toggleFullscreen} title="Fullscreen" aria-label="Fullscreen">
              ⛶
            </button>
            <button
              type="button"
              className={`vplayer-btn vplayer-settings ${panel ? "active" : ""}`}
              onClick={() => setPanel(panel ? null : "main")}
              aria-label="Settings"
            >
              ⚙
            </button>
          </div>
        </div>
      </div>

      {panel && (
        <div className="vplayer-panel">
          {panel !== "main" && (
            <button type="button" className="vplayer-back" onClick={() => setPanel("main")}>
              ← Back
            </button>
          )}

          {panel === "quality" && (
            <div className="vplayer-panel-body">
              <p className="vplayer-panel-title">Quality</p>
              {uniqueQualities.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  className={`vplayer-option ${quality === q.value ? "active" : ""}`}
                  onClick={() => {
                    setQuality(q.value);
                    setPanel(null);
                  }}
                >
                  {q.label}
                  {q.value === "auto" && <span className="hint">Adjusts to connection</span>}
                </button>
              ))}
            </div>
          )}

          {panel === "speed" && (
            <div className="vplayer-panel-body">
              <p className="vplayer-panel-title">Playback speed</p>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`vplayer-option ${speed === s ? "active" : ""}`}
                  onClick={() => {
                    setSpeed(s);
                    setPanel(null);
                  }}
                >
                  {s === 1 ? "Normal" : `${s}×`}
                </button>
              ))}
            </div>
          )}

          {panel === "captions" && (
            <div className="vplayer-panel-body">
              <p className="vplayer-panel-title">Captions</p>
              <button
                type="button"
                className={`vplayer-option ${subtitleId === "off" ? "active" : ""}`}
                onClick={() => {
                  setSubtitleId("off");
                  setPanel(null);
                }}
              >
                Off
              </button>
              {subtitles.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`vplayer-option ${subtitleId === s.id ? "active" : ""}`}
                  onClick={() => {
                    setSubtitleId(s.id);
                    setPanel(null);
                  }}
                >
                  {s.label}
                  <span className="hint">{s.kind === "auto" ? "Auto-generated" : "Manual"}</span>
                </button>
              ))}
            </div>
          )}

          {panel === "audio" && (
            <div className="vplayer-panel-body">
              <p className="vplayer-panel-title">Audio track</p>
              {(playback?.audioTracks?.length ? playback.audioTracks : [{ id: "default", label: "Original" }]).map(
                (a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`vplayer-option ${audioId === String(a.id) ? "active" : ""}`}
                    onClick={() => selectAudio(String(a.id))}
                  >
                    {a.label}
                  </button>
                )
              )}
            </div>
          )}

          {panel === "codec" && (
            <div className="vplayer-panel-body">
              <p className="vplayer-panel-title">Codec</p>
              {["h264", "vp9", "av1"].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`vplayer-option ${codec === c ? "active" : ""}`}
                  disabled={!codecsAvailable.includes(c) && c !== "h264"}
                  onClick={() => {
                    setCodec(c);
                    setQuality("auto");
                    setPanel(null);
                  }}
                >
                  {c.toUpperCase()}
                  {!codecsAvailable.includes(c) && c !== "h264" && (
                    <span className="hint">Not available</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {panel === "main" && (
            <div className="vplayer-panel-body vplayer-panel-menu">
              <button type="button" onClick={() => setPanel("quality")}>Quality · {quality === "auto" ? "Auto" : quality}</button>
              <button type="button" onClick={() => setPanel("speed")}>Speed · {speed}×</button>
              <button type="button" onClick={() => setPanel("captions")}>Captions</button>
              <button type="button" onClick={() => setPanel("audio")}>Audio track</button>
              <button type="button" onClick={() => setPanel("codec")}>Codec · {codec.toUpperCase()}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MiniPlayerBar() {
  const { mini, closeMini } = usePlayer();
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !mini) return;
    el.currentTime = mini.currentTime || 0;
    if (mini.playing) el.play().catch(() => {});
  }, [mini]);

  if (!mini) return null;

  return (
    <div className="mini-player">
      <div className="mini-player-video-wrap">
        <video
          ref={videoRef}
          src={mini.src}
          playsInline
          controls
          className="mini-player-video"
        />
      </div>
      <div className="mini-player-meta">
        <Link to={`/watch/${mini.id}`} className="mini-player-title" onClick={closeMini}>
          {mini.title}
        </Link>
        <span className="mini-player-channel">{mini.channel}</span>
      </div>
      <button type="button" className="mini-player-close" onClick={closeMini} aria-label="Close mini player">
        ×
      </button>
    </div>
  );
}
