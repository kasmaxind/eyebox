import { promises as fs } from "fs";
import path from "path";
import type { Playlist, UserState } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_PATH = path.join(DATA_DIR, "user-state.json");

const defaultState = (): UserState => ({
  favorites: [],
  playlists: [
    {
      id: "evening-drive",
      name: "Evening Drive",
      description: "Warm chrome and open road visuals.",
      videoIds: ["neon-tide", "coastline-fm", "amber-static"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  recentlyWatched: [],
});

async function ensureStateFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STATE_PATH);
  } catch {
    await fs.writeFile(STATE_PATH, JSON.stringify(defaultState(), null, 2));
  }
}

export async function readState(): Promise<UserState> {
  await ensureStateFile();
  const raw = await fs.readFile(STATE_PATH, "utf8");
  return JSON.parse(raw) as UserState;
}

export async function writeState(state: UserState): Promise<void> {
  await ensureStateFile();
  await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2));
}

export async function toggleFavorite(videoId: string): Promise<string[]> {
  const state = await readState();
  const set = new Set(state.favorites);
  if (set.has(videoId)) set.delete(videoId);
  else set.add(videoId);
  state.favorites = Array.from(set);
  await writeState(state);
  return state.favorites;
}

export async function markWatched(videoId: string): Promise<void> {
  const state = await readState();
  state.recentlyWatched = [
    videoId,
    ...state.recentlyWatched.filter((id) => id !== videoId),
  ].slice(0, 12);
  await writeState(state);
}

export async function createPlaylist(
  name: string,
  description = ""
): Promise<Playlist> {
  const state = await readState();
  const playlist: Playlist = {
    id: `pl-${Date.now().toString(36)}`,
    name: name.trim() || "Untitled",
    description: description.trim(),
    videoIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.playlists.unshift(playlist);
  await writeState(state);
  return playlist;
}

export async function updatePlaylist(
  id: string,
  patch: Partial<Pick<Playlist, "name" | "description" | "videoIds">>
): Promise<Playlist | null> {
  const state = await readState();
  const idx = state.playlists.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  state.playlists[idx] = {
    ...state.playlists[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeState(state);
  return state.playlists[idx];
}

export async function deletePlaylist(id: string): Promise<boolean> {
  const state = await readState();
  const before = state.playlists.length;
  state.playlists = state.playlists.filter((p) => p.id !== id);
  if (state.playlists.length === before) return false;
  await writeState(state);
  return true;
}

export async function addToPlaylist(
  playlistId: string,
  videoId: string
): Promise<Playlist | null> {
  const state = await readState();
  const pl = state.playlists.find((p) => p.id === playlistId);
  if (!pl) return null;
  if (!pl.videoIds.includes(videoId)) {
    pl.videoIds.push(videoId);
    pl.updatedAt = new Date().toISOString();
    await writeState(state);
  }
  return pl;
}

export async function removeFromPlaylist(
  playlistId: string,
  videoId: string
): Promise<Playlist | null> {
  const state = await readState();
  const pl = state.playlists.find((p) => p.id === playlistId);
  if (!pl) return null;
  pl.videoIds = pl.videoIds.filter((id) => id !== videoId);
  pl.updatedAt = new Date().toISOString();
  await writeState(state);
  return pl;
}
