# EyeBox

YouTube-like video platform with modern watch, Shorts, Live, Studio, library, and creator features.

## Quick start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

From the repo root you can also run `npm run dev`.

## Features

- **Home feed** — category chips, For You mix, continue watching, Shorts shelf, Restricted Mode
- **Watch page** — chapters, theater, PiP, fullscreen, volume, speed, quality, captions, keyboard shortcuts, likes/saves, share with timestamp, clip/download, autoplay countdown, transcript, comments + AI summary
- **Mini player** — keeps playing when you leave a watch page
- **Shorts** — vertical snap feed with mute, share, subscribe
- **Search** — video / Shorts / live / channel filters plus sort and duration
- **Channels** — Home, Videos, Shorts, Live, Playlists, Community, About
- **Subscriptions**, trending, live rooms
- **Library** — history (clear/remove), watch later, liked, playlists (create/save locally)
- **Creator Studio** — dashboard, demo upload, analytics
- **Settings** — dark/light theme, autoplay, Restricted Mode
- **Notifications** — mark read / mark all read
- **Create menu** — upload, go live, Studio
- **Account menu** — channel, Studio, settings, theme toggle

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript + Tailwind CSS v4
- Client store for engagement state (persisted in `localStorage`)

Demo media uses public Google sample MP4s and Unsplash imagery.
