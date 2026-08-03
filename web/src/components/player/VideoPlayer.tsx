"use client";

import { useEffect, useRef, useState } from "react";
import type { Chapter, Video } from "@/lib/types";
import { cn, formatDuration } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import {
  IconExpand,
  IconPause,
  IconPip,
  IconPlay,
  IconTheater,
  IconVolume,
} from "@/components/ui/Icons";

export function VideoPlayer({
  video,
  autoPlay = true,
  theater,
  onTheaterToggle,
  onTimeUpdate,
}: {
  video: Video;
  autoPlay?: boolean;
  theater?: boolean;
  onTheaterToggle?: () => void;
  onTimeUpdate?: (t: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const { setProgress, addHistory, progress } = useAppStore();

  useEffect(() => {
    addHistory(video.id);
    const el = videoRef.current;
    if (!el) return;
    const start = (progress[video.id] ?? video.progress ?? 0) * (video.duration || el.duration || 0);
    if (start > 5 && start < (video.duration || Infinity) - 5) {
      el.currentTime = start;
    }
  }, [video.id, addHistory, progress, video.progress, video.duration]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) void el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, video.id]);

  function bumpControls() {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2200);
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
    const wrap = videoRef.current?.parentElement;
    if (!wrap) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await wrap.requestFullscreen();
  }

  const activeChapter =
    video.chapters?.slice().reverse().find((c) => current >= c.start) ?? video.chapters?.[0];

  return (
    <div
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
        onEnded={() => setPlaying(false)}
      />

      {video.isLive && (
        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-md bg-live px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
          Live
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-16 transition-opacity",
          showControls || !playing ? "opacity-100" : "opacity-0",
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

        <div className="flex items-center gap-1 text-white">
          <button
            type="button"
            className="icon-btn h-9 w-9 text-white hover:bg-white/10"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
          </button>
          <button type="button" className="icon-btn h-9 w-9 text-white hover:bg-white/10" aria-label="Volume">
            <IconVolume size={18} />
          </button>
          <span className="ml-1 text-xs tabular-nums text-white/85">
            {formatDuration(current)} / {video.isLive ? "LIVE" : formatDuration(duration || video.duration)}
          </span>
          {activeChapter && (
            <span className="ml-2 hidden truncate text-xs text-white/70 sm:inline">
              {activeChapter.title}
            </span>
          )}
          <div className="ml-auto flex items-center">
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
              >
                <IconTheater size={18} />
              </button>
            )}
            <button
              type="button"
              className="icon-btn h-9 w-9 text-white hover:bg-white/10"
              onClick={toggleFullscreen}
              aria-label="Fullscreen"
            >
              <IconExpand size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
