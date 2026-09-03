import type { Video } from "./types";

export const catalog: Video[] = [
  {
    id: "neon-tide",
    title: "Neon Tide",
    artist: "Lumen Circuit",
    genre: "Electronic",
    description:
      "A late-night pulse of chrome synths and tidal drums — the official visual for Neon Tide.",
    durationSec: 12,
    views: 1284500,
    releasedAt: "2025-11-02",
    videoUrl: "/media/videos/neon-tide.mp4",
    posterUrl: "/media/posters/neon-tide.jpg",
    featured: true,
    tags: ["synth", "night", "club"],
  },
  {
    id: "glass-horizon",
    title: "Glass Horizon",
    artist: "Mira Vale",
    genre: "Indie",
    description:
      "Soft guitars under a wide sky. Mira Vale's Glass Horizon arrives with a sun-washed visual.",
    durationSec: 11,
    views: 892300,
    releasedAt: "2025-09-18",
    videoUrl: "/media/videos/glass-horizon.mp4",
    posterUrl: "/media/posters/glass-horizon.jpg",
    featured: true,
    tags: ["dreamy", "acoustic", "daylight"],
  },
  {
    id: "ember-lane",
    title: "Ember Lane",
    artist: "Redline Choir",
    genre: "Rock",
    description:
      "Gritty guitars and a walk through burning city lights — Ember Lane in motion.",
    durationSec: 13,
    views: 2100450,
    releasedAt: "2025-06-04",
    videoUrl: "/media/videos/ember-lane.mp4",
    posterUrl: "/media/posters/ember-lane.jpg",
    tags: ["guitar", "live", "fire"],
  },
  {
    id: "silver-rush",
    title: "Silver Rush",
    artist: "Kite & Cobalt",
    genre: "Alt Pop",
    description:
      "Bright hooks, chrome frames, and a rush of silver light across the frame.",
    durationSec: 10,
    views: 1542200,
    releasedAt: "2026-01-12",
    videoUrl: "/media/videos/silver-rush.mp4",
    posterUrl: "/media/posters/silver-rush.jpg",
    featured: true,
    tags: ["pop", "chrome", "rush"],
  },
  {
    id: "volt-garden",
    title: "Volt Garden",
    artist: "Ivy Frequency",
    genre: "Electronic",
    description:
      "Botanical techno in a charged greenhouse — Volt Garden blooms in green voltage.",
    durationSec: 12,
    views: 743100,
    releasedAt: "2025-08-21",
    videoUrl: "/media/videos/volt-garden.mp4",
    posterUrl: "/media/posters/volt-garden.jpg",
    tags: ["techno", "nature", "green"],
  },
  {
    id: "paper-moon",
    title: "Paper Moon",
    artist: "June Aster",
    genre: "Ambient",
    description:
      "Folded paper skies and hush pads. A quiet visual poem for Paper Moon.",
    durationSec: 11,
    views: 512800,
    releasedAt: "2025-12-01",
    videoUrl: "/media/videos/paper-moon.mp4",
    posterUrl: "/media/posters/paper-moon.jpg",
    tags: ["ambient", "soft", "night"],
  },
  {
    id: "coastline-fm",
    title: "Coastline FM",
    artist: "Harbor Signal",
    genre: "Indie",
    description:
      "Salt air radio waves and coastal bounce — Harbor Signal's Coastline FM.",
    durationSec: 14,
    views: 998700,
    releasedAt: "2026-02-08",
    videoUrl: "/media/videos/coastline-fm.mp4",
    posterUrl: "/media/posters/coastline-fm.jpg",
    featured: true,
    tags: ["beach", "radio", "summer"],
  },
  {
    id: "amber-static",
    title: "Amber Static",
    artist: "Noir Alloy",
    genre: "R&B",
    description:
      "Velvet vocals through warm tape hiss — Amber Static glows in the dark.",
    durationSec: 12,
    views: 1678900,
    releasedAt: "2025-10-30",
    videoUrl: "/media/videos/amber-static.mp4",
    posterUrl: "/media/posters/amber-static.jpg",
    tags: ["rnb", "warm", "night"],
  },
];

export const genres = [
  "Electronic",
  "Indie",
  "R&B",
  "Alt Pop",
  "Ambient",
  "Rock",
] as const;

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
