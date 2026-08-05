"use client";

import { useEffect, useRef, useState } from "react";
import type { Chapter, Video } from "@/lib/types";
import { cn, formatDuration } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import {
  IconCaptions,
  IconExpand,
  IconMute,
  IconPause,
  IconPip,
  IconPlay,
  IconSettings,
  IconTheater,
  IconVolume,
} from "@/components/ui/Icons";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const QUALITIES = ["Auto", "1080p", "720p", "480p", "360p"] as const;

export function VideoPlayer({
  video,
  autoPlay = true,
  theater,
  onTheaterToggle,
  onTimeUpdate,
  onEnded,
  captions,
  seekToTime,
}: {
  video: Video;
  autoPlay?: boolean;
  theater?: boolean;
  onTheaterToggle?: () => void;
  onTimeUpdate?: (t: number) => void;
  onEnded?: () => void;
  captions?: { start: number; end: number; text: string }[];
  seekToTime?: number | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [showControls, setShowControls] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]>("Auto");
  const [showCaptions, setShowCaptions] = useState(false);
  const [menu, setMenu] = useState<"none" | "speed" | "quality" | "settings">("none");
  const [showHelp, setShowHelp] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const { setProgress, addHistory, progress } = useAppStore();

  useEffect(() => {
    if (seekToTime == null) return;
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = seekToTime;
    setPlaying(true);
  }, [seekToTime]);

  useEffect(() => {
    addHistory(video.id);
    const el = videoRef.current;
    if (!el) return;
    const start = (progress[video.id] ?? video.progress ?? 0) * (video.duration || el.duration || 0);
    if (start > 5 && start < (video.duration || Infinity) - 5) {
      el.currentTime = start;
    }
    setMenu("none");
  }, [video.id, addHistory, progress, video.progress, video.duration]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) void el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, video.id]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
    el.volume = volume;
    el.playbackRate = speed;
  }, [muted, volume, speed]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      const el = videoRef.current;
      if (!el) return;
      const show = () => {
        setShowControls(true);
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => {
          if (playing && menu === "none") setShowControls(false);
        }, 2400);
      };
      switch (e.key.toLowerCase()) {
        case "k":
        case " ":
          e.preventDefault();
          setPlaying((p) => !p);
          show();
          break;
        case "j":
          el.currentTime = Math.max(0, el.currentTime - 10);
          show();
          break;
        case "l":
          el.currentTime = Math.min(el.duration || 0, el.currentTime + 10);
          show();
          break;
        case "arrowleft":
          el.currentTime = Math.max(0, el.currentTime - 5);
          show();
          break;
        case "arrowright":
          el.currentTime = Math.min(el.duration || 0, el.currentTime + 5);
          show();
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((v) => Math.min(1, +(v + 0.05).toFixed(2)));
          setMuted(false);
          show();
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((v) => Math.max(0, +(v - 0.05).toFixed(2)));
          show();
          break;
        case "m":
          setMuted((m) => !m);
          show();
          break;
        case "f":
          void toggleFullscreen();
          break;
        case "t":
          onTheaterToggle?.();
          break;
        case "c":
          setShowCaptions((c) => !c);
          show();
          break;
        case "?":
          setShowHelp((h) => !h);
          break;
        case "escape":
          setMenu("none");
          setShowHelp(false);
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onTheaterToggle, playing, menu]);

  function bumpControls() {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing && menu === "none") setShowControls(false);
    }, 2400);
  }

  function seekTo(ratio: number) {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    el.currentTime = ratio * el.duration;
  }

  function jumpChapter(ch: Chapter) {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = ch.start;
    setPlaying(true);
  }

  async function togglePip() {
    const el = videoRef.current;
    if (!el) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await el.requestPictureInPicture();
    } catch {
      /* unsupported */
    }
  }

  async function toggleFullscreen() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await wrap.requestFullscreen();
  }

  const activeChapter =
    video.chapters?.slice().reverse().find((c) => current >= c.start) ?? video.chapters?.[0];

  const activeCaption = showCaptions
    ? captions?.find((c) => current >= c.start && current <= c.end)
    : undefined;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-black shadow-[var(--shadow)]",
        theater ? "w-full" : "aspect-video w-full",
      )}
      onMouseMove={bumpControls}
      onClick={() => {
        bumpControls();
        setPlaying((p) => !p);
      }}
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnail}
        className={cn("h-full w-full object-contain", theater && "max-h-[78vh]")}
        playsInline
        onTimeUpdate={() => {
          const el = videoRef.current;
          if (!el) return;
          setCurrent(el.currentTime);
          onTimeUpdate?.(el.currentTime);
          if (el.duration) setProgress(video.id, el.currentTime / el.duration);
        }}
        onLoadedMetadata={() => {
          const el = videoRef.current;
          if (el?.duration) setDuration(el.duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      />

      {video.isLive && (
        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-md bg-live px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
          Live
        </div>
      )}

      {activeCaption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex justify-center px-4">
          <p className="max-w-[90%] rounded-md bg-black/75 px-3 py-1.5 text-center text-sm font-medium text-white">
            {activeCaption.text}
          </p>
        </div>
      )}

      {showHelp && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-6"
          onClick={(e) => {
            e.stopPropagation();
            setShowHelp(false);
          }}
        >
          <div className="scale-in max-w-sm rounded-2xl border border-white/15 bg-bg-elevated p-5 text-sm text-text">
            <p className="mb-3 font-semibold">Keyboard shortcuts</p>
            <ul className="space-y-1.5 text-text-muted">
              <li>
                <kbd className="kbd">K</kbd> / <kbd className="kbd">Space</kbd> Play / pause
              </li>
              <li>
                <kbd className="kbd">J</kbd> / <kbd className="kbd">L</kbd> −10s / +10s
              </li>
              <li>
                <kbd className="kbd">←</kbd> / <kbd className="kbd">→</kbd> −5s / +5s
              </li>
              <li>
                <kbd className="kbd">M</kbd> Mute · <kbd className="kbd">F</kbd> Fullscreen ·{" "}
                <kbd className="kbd">T</kbd> Theater
              </li>
              <li>
                <kbd className="kbd">C</kbd> Captions · <kbd className="kbd">?</kbd> Help
              </li>
            </ul>
          </div>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-16 transition-opacity",
          showControls || !playing || menu !== "none" ? "opacity-100" : "opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {video.chapters && video.chapters.length > 0 && (
          <div className="mb-2 flex gap-1 overflow-x-auto scrollbar-thin">
            {video.chapters.map((ch) => (
              <button
                key={ch.title}
                type="button"
                onClick={() => jumpChapter(ch)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                  activeChapter?.title === ch.title
                    ? "bg-white text-black"
                    : "bg-white/15 text-white hover:bg-white/25",
                )}
              >
                {formatDuration(ch.start)} · {ch.title}
              </button>
            ))}
          </div>
        )}

        <div
          className="group/seek mb-2 h-1.5 cursor-pointer rounded-full bg-white/25"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seekTo((e.clientX - rect.left) / rect.width);
          }}
        >
          <div
            className="progress-bar relative h-full rounded-full"
            style={{ width: `${duration ? (current / duration) * 100 : 0}%` }}
          >
            <span className="absolute -right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-accent opacity-0 shadow group-hover/seek:opacity-100" />
          </div>
        </div>

        <div className="relative flex items-center gap-1 text-white">
          <button
            type="button"
            className="icon-btn h-9 w-9 text-white hover:bg-white/10"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
          </button>

          <div className="group/vol flex items-center">
            <button
              type="button"
              className="icon-btn h-9 w-9 text-white hover:bg-white/10"
              aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              onClick={() => setMuted((m) => !m)}
            >
              {muted || volume === 0 ? <IconMute size={18} /> : <IconVolume size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                setMuted(v === 0);
              }}
              className="vol-slider w-0 overflow-hidden opacity-0 transition-all group-hover/vol:ml-1 group-hover/vol:w-20 group-hover/vol:opacity-100"
              aria-label="Volume"
            />
          </div>

          <span className="ml-1 text-xs tabular-nums text-white/85">
            {formatDuration(current)} / {video.isLive ? "LIVE" : formatDuration(duration || video.duration)}
          </span>
          {activeChapter && (
            <span className="ml-2 hidden truncate text-xs text-white/70 sm:inline">{activeChapter.title}</span>
          )}

          <div className="ml-auto flex items-center">
            <button
              type="button"
              className={cn(
                "icon-btn h-9 w-9 text-white hover:bg-white/10",
                showCaptions && "bg-white/15",
              )}
              onClick={() => setShowCaptions((c) => !c)}
              aria-label="Captions"
              title="Captions (C)"
            >
              <IconCaptions size={18} />
            </button>

            <div className="relative">
              <button
                type="button"
                className="icon-btn h-9 w-9 text-white hover:bg-white/10"
                onClick={() => setMenu((m) => (m === "settings" ? "none" : "settings"))}
                aria-label="Settings"
              >
                <IconSettings size={18} />
              </button>
              {menu === "settings" && (
                <div className="absolute bottom-11 right-0 z-20 w-48 scale-in overflow-hidden rounded-xl border border-white/10 bg-[#1a1c22] py-1 text-sm shadow-xl">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-white/10"
                    onClick={() => setMenu("speed")}
                  >
                    <span>Playback speed</span>
                    <span className="text-white/60">{speed === 1 ? "Normal" : `${speed}x`}</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-white/10"
                    onClick={() => setMenu("quality")}
                  >
                    <span>Quality</span>
                    <span className="text-white/60">{quality}</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full px-3 py-2.5 hover:bg-white/10"
                    onClick={() => {
                      setShowHelp(true);
                      setMenu("none");
                    }}
                  >
                    Keyboard shortcuts
                  </button>
                </div>
              )}
              {menu === "speed" && (
                <div className="absolute bottom-11 right-0 z-20 w-40 scale-in overflow-hidden rounded-xl border border-white/10 bg-[#1a1c22] py-1 text-sm shadow-xl">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-white/60 hover:bg-white/10"
                    onClick={() => setMenu("settings")}
                  >
                    ← Speed
                  </button>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={cn(
                        "flex w-full px-3 py-2 hover:bg-white/10",
                        speed === s && "font-semibold text-accent",
                      )}
                      onClick={() => {
                        setSpeed(s);
                        setMenu("none");
                      }}
                    >
                      {s === 1 ? "Normal" : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
              {menu === "quality" && (
                <div className="absolute bottom-11 right-0 z-20 w-40 scale-in overflow-hidden rounded-xl border border-white/10 bg-[#1a1c22] py-1 text-sm shadow-xl">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-white/60 hover:bg-white/10"
                    onClick={() => setMenu("settings")}
                  >
                    ← Quality
                  </button>
                  {QUALITIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={cn(
                        "flex w-full px-3 py-2 hover:bg-white/10",
                        quality === q && "font-semibold text-accent",
                      )}
                      onClick={() => {
                        setQuality(q);
                        setMenu("none");
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="icon-btn h-9 w-9 text-white hover:bg-white/10"
              onClick={togglePip}
              aria-label="Picture in picture"
              title="Mini player (PiP)"
            >
              <IconPip size={18} />
            </button>
            {onTheaterToggle && (
              <button
                type="button"
                className="icon-btn h-9 w-9 text-white hover:bg-white/10"
                onClick={onTheaterToggle}
                aria-label="Theater mode"
                title="Theater (T)"
              >
                <IconTheater size={18} />
              </button>
            )}
            <button
              type="button"
              className="icon-btn h-9 w-9 text-white hover:bg-white/10"
              onClick={toggleFullscreen}
              aria-label="Fullscreen"
              title="Fullscreen (F)"
            >
              <IconExpand size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
