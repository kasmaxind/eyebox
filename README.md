# EyeBox

Free self-hosted YouTube-like video platform with **full authentication**, a **local Range-streaming video server**, and **true end-to-end encryption** for private uploads.

## Features

- **Auth** — register/login, JWT access + rotating refresh tokens, sessions, roles
- **Free video server** — local disk storage, HTTP `206` Range streaming, ffmpeg thumbnails (no paid CDN)
- **E2E encryption** — AES-GCM content encryption in the browser; ECDH P-256 key wrap; server stores ciphertext only
- **YouTube-like UX** — home/trending/shorts, watch page, comments, likes, subscriptions, playlists, watch later, history, notifications, creator studio, search, channels

## Stack

| Layer | Tech |
|-------|------|
| Web | React 19, Vite, TypeScript, Web Crypto |
| API | Express, better-sqlite3, JWT, Multer |
| Media | ffmpeg / ffprobe, HTTP Range |

## Quick start

```bash
cp .env.example .env
npm run install:all
npm run seed          # demo users + sample clips (needs ffmpeg)
npm run dev           # API :4000 · Web :5173
```

### Demo accounts

| Email | Password |
|-------|----------|
| `admin@eyebox.local` | `Admin@EyeBox2026!` |
| `creator@eyebox.local` | `Creator@EyeBox2026!` |
| `viewer@eyebox.local` | `Viewer@EyeBox2026!` |

## E2E encryption flow

1. Open **E2E Vault** → create a vault passphrase → browser generates ECDH keypair  
2. Private key is wrapped with PBKDF2 + AES-GCM and stored on the server  
3. Encrypted upload: content key encrypts the file locally → wrapped key + ciphertext uploaded  
4. Playback: unlock vault → unwrap content key → decrypt in browser → play via blob URL  
5. Share: wrap content key to another user’s public key (server never sees plaintext keys)

## API overview

- `POST /api/auth/register|login|refresh|logout`
- `GET/PUT /api/auth/me` · `PUT /api/auth/e2e-keys`
- `GET /api/videos` · `POST /api/videos/upload` · `POST /api/videos/upload-encrypted`
- `GET /api/videos/:id/stream` (Range) · `GET /api/videos/:id/encrypted`
- Comments, playlists, subscriptions, notifications under `/api/*`

## Production notes

- Change `JWT_SECRET` / `JWT_REFRESH_SECRET` in `.env`
- Put TLS in front (nginx/caddy); Web Crypto for E2E needs secure context
- Back up `data/eyebox.db` and `data/{videos,encrypted,thumbs}`
