# Eyebox

Full-stack music video app: browse, search, play, save favorites, and manage playlists.

## Features

- **Home** — featured hero + trending / fresh / genre rails
- **Browse** — filter the catalog by genre
- **Watch** — HTML5 player with save + add-to-playlist
- **Library** — favorites and recently watched
- **Playlists** — create, open, and edit playlists (persisted in `data/user-state.json`)
- **Search** — find videos by title, artist, genre, or tags
- **API** — REST routes under `/api/*`

## Run

```bash
npm install
npm run generate-media   # needs ffmpeg (sample clips)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 15 (App Router) + TypeScript
- File-backed user state (favorites, playlists, history)
- Local sample music-video clips generated with ffmpeg
