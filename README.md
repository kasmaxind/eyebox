# EyeBox

YouTube-like video platform with modern watch, Shorts, Live, Studio, and library features.

## Quick start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

From the repo root you can also run `npm run dev`.

## Features

- **Home feed** with category chips, For You mix, continue watching, and Shorts shelf
- **Watch page** with chapters, theater mode, PiP, likes/saves, related rail, comments + AI summary
- **Mini player** that keeps playing when you leave a watch page
- **Shorts** vertical snap feed
- **Search** with video / Shorts / live / channel filters
- **Channels**, subscriptions, trending, live
- **Library** — history, watch later, liked, playlists (persisted in `localStorage`)
- **Creator Studio** — dashboard, demo upload, analytics

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript + Tailwind CSS v4
- Client store for engagement state (no backend required for the demo)

Demo media uses public Google sample MP4s and Unsplash imagery.
