# AGENTS.md

## Cursor Cloud specific instructions

### Repository state

The default `eyebox` branch is an empty scaffold (README only). The runnable **Eyebox** app (self-hosted YouTube-like video streaming) lives on `cursor/eyebox-video-streaming-9fbe`. Check out that branch (or merge it) before installing dependencies or running the app.

### Stack

| Layer | Tech | Port |
| --- | --- | --- |
| Web UI | React + Vite | 5173 (dev) |
| API / stream server | Express | 4000 |
| Metadata | SQLite (`better-sqlite3`) | `data/` (runtime) |
| Media | Local `uploads/` + ffmpeg thumbnails | — |

### System dependencies

- **Node.js** (v22+ works; repo uses ES modules)
- **ffmpeg** — required for `npm run seed` (demo clip + thumbnail generation). Already present on Cloud Agent VMs.

### Common commands

See `README.md` for full quick-start. Summary:

```bash
npm install && npm run install:all   # install root + server + web deps
npm run seed                         # generate demo videos + SQLite seed (needs ffmpeg)
npm run dev                          # API (:4000) + Vite UI (:5173) via concurrently
npm run build                        # build web for production
npm start                            # serve built UI from Express (:4000)
```

### Dev server notes

- Vite proxies `/api` to `http://localhost:4000` (see `web/vite.config.js`).
- `uploads/` and `data/` are created at runtime; they are gitignored.
- Re-run `npm run seed` to reset demo content (idempotent enough for local dev).
- No `lint` or `test` npm scripts are defined in this repo yet.

### E2E smoke checks

- `curl -s http://localhost:4000/api/videos` → JSON with `videos` array
- `curl -sI -H "Range: bytes=0-1023" http://localhost:4000/api/stream/dQw9demo001` → `206 Partial Content`
- Open http://localhost:5173 — home feed, watch page, search, and category filters
