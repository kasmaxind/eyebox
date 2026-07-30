# Eyebox

Free, self-hosted YouTube-like video streaming platform.

Upload videos, browse a feed, watch with HTTP **Range-request** progressive streaming, like, comment, and search — all on your own machine. No cloud CDN required.

## Stack

| Layer | Tech |
| --- | --- |
| Web UI | React + Vite |
| API / stream server | Express |
| Metadata | SQLite (`better-sqlite3`) |
| Media | Local `uploads/` + ffmpeg thumbnails |

## Quick start

```bash
# install
npm install
npm run install:all

# generate demo clips + DB seed (requires ffmpeg)
npm run seed

# run API (:4000) + UI (:5173)
npm run dev
```

Open **http://localhost:5173**

Production-style (serve built UI from the API):

```bash
npm run build
npm start
```

Then open **http://localhost:4000**

## Features

- Home feed with category chips and search
- Watch page with HTML5 player (Range streaming)
- Related videos, likes, comments
- Channel pages
- Drag-and-drop upload (MP4 / WebM / MOV, up to 2 GB)
- Auto duration probe + thumbnail via ffmpeg

## Streaming

`GET /api/stream/:id` supports `Range` headers and returns `206 Partial Content`, so the browser can seek without downloading the whole file — the same pattern many free self-hosted players use.

## Project layout

```
server/     Express API + Range streamer + seed
web/        React frontend
uploads/    Video files + thumbs (created at runtime)
data/       SQLite database (created at runtime)
```

## API sketch

- `GET /api/videos?q=&category=&sort=`
- `GET /api/videos/:id`
- `POST /api/videos/:id/like`
- `POST /api/videos/:id/comments`
- `POST /api/upload` (multipart `video`)
- `GET /api/stream/:id`
- `GET /api/channels/:handle`
