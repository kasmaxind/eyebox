export type Genre =
  | "Electronic"
  | "Indie"
  | "R&B"
  | "Alt Pop"
  | "Ambient"
  | "Rock";

export interface Video {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  description: string;
  durationSec: number;
  views: number;
  releasedAt: string;
  videoUrl: string;
  posterUrl: string;
  featured?: boolean;
  tags: string[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  favorites: string[];
  playlists: Playlist[];
  recentlyWatched: string[];
}
