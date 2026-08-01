# EYEBOX TUBE.AI

**AI-powered video streaming platform** — a production-ready YouTube-like product with creator studio, admin panel, adaptive streaming, and heuristic AI recommendations.

![EYEBOX](https://img.shields.io/badge/EYEBOX-TUBE.AI-00E5FF?style=for-the-badge&labelColor=070A12)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![Express](https://img.shields.io/badge/Express-TypeScript-00E5FF?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square)

---

## Features

| Area | Capabilities |
|------|----------------|
| **Streaming** | Adaptive quality ladder (360p–8K ready), Video.js player, PiP, captions, shorts, live |
| **Upload** | Resumable chunks, FFmpeg transcoding, auto thumbnails, scheduling, visibility |
| **AI** | Recommendations, search ranking, summaries, chapters, spam detection, trends |
| **Social** | Subscribe, like/dislike, comments/replies, playlists, notifications, live chat |
| **Creator Studio** | Dashboard, content, analytics, monetization, branding, live |
| **Admin** | Users, videos, channels, reports, ads, platform analytics |
| **Auth** | Email + OTP, Google OAuth, JWT access/refresh, multi-device sessions |
| **Security** | Helmet, rate limits, CSRF, XSS sanitization, bcrypt, audit logs |

## Monorepo structure

```
eyebox/
├── apps/
│   ├── api/          # Express + TypeScript backend (@eyebox/api)
│   └── web/          # Next.js 15 + React 19 frontend (@eyebox/web)
├── docker/           # API & Web Dockerfiles
├── nginx/            # Reverse proxy config
├── scripts/          # deploy.sh, dev-setup.sh
├── docs/             # API documentation
├── docker-compose.yml
└── .env.example
```

## Quick start (local)

### Prerequisites

- Node.js 20+
- Docker (MongoDB + Redis) — or local MongoDB 7 / Redis 7
- FFmpeg (for video processing)

### Setup

```bash
chmod +x scripts/*.sh
./scripts/dev-setup.sh

# or manually:
cp .env.example .env
npm install
docker compose up -d mongo redis
npm run seed
npm run dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |

### Default accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@eyebox.ai` | `Admin@Eyebox2026!` |
| Creator | `creator@eyebox.ai` | `Creator@Eyebox2026!` |

## Docker production stack

```bash
cp .env.example .env   # set strong JWT/CSRF secrets + AWS keys
./scripts/deploy.sh
```

Services: `mongo`, `redis`, `api`, `web`, `nginx` (ports 80/443).

## Environment

See [`.env.example`](./.env.example) for all variables. Critical ones:

- `MONGODB_URI`, `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CSRF_SECRET`
- `USE_LOCAL_STORAGE=true` for disk uploads (dev); set AWS S3 + CloudFront for prod
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for Google login
- `SMTP_*` for email OTP (dev logs OTP when SMTP is unset)

## API overview

Base path: `/api/v1`  
Full reference: [docs/API.md](./docs/API.md)

| Module | Prefix |
|--------|--------|
| Auth | `/auth` |
| Videos | `/videos` |
| Upload | `/upload` |
| Comments | `/comments` |
| Playlists | `/playlists` |
| Subscriptions | `/subscriptions` |
| Channels | `/channels` |
| Search | `/search` |
| Recommendations | `/recommendations` |
| Notifications | `/notifications` |
| Analytics | `/analytics` |
| Admin | `/admin` |
| Live | `/live` |
| Premium | `/premium` |

Response shape:

```json
{
  "success": true,
  "data": {},
  "message": "",
  "meta": { "page": 1, "limit": 20, "total": 100, "nextCursor": null }
}
```

## Frontend routes

Landing, Home, Trending, Music, Gaming, Movies, Education, Sports, News, Shorts, Live, Subscriptions, History, Watch Later, Liked, Downloads, Library, Search, Upload, Watch, Channel, Playlist, Premium, Notifications, Profile, Settings, Studio (`/studio/*`), Admin (`/admin/*`), Auth.

## Architecture notes

- **Auth**: httpOnly cookies + Bearer access token; refresh rotation per device
- **Media**: Multer → FFmpeg quality ladder → local `/uploads` or S3; CloudFront-ready URLs
- **Realtime**: Socket.IO for notifications, live chat, upload progress
- **AI**: Heuristic engine (tags, history, velocity) with optional OpenAI hook via `AI_PROVIDER`
- **Caching**: Redis for sessions, rate-limit helpers, feed/recommendation caches

## Scripts

```bash
npm run dev          # API + Web concurrently
npm run build        # Build both
npm run seed         # Seed categories + demo content
npm run docker:up    # Full compose stack
npm run lint         # Typecheck / Next lint
```

## Security checklist (production)

1. Rotate all secrets in `.env`
2. Set `COOKIE_SECURE=true`, `NODE_ENV=production`
3. Terminate TLS at Nginx / CloudFront / load balancer
4. Configure real SMTP and Google OAuth redirect URIs
5. Set `USE_LOCAL_STORAGE=false` and wire S3 + CloudFront
6. Restrict `CORS_ORIGINS` to your domains
7. Change default admin password immediately after first login

## License

Proprietary — EYEBOX TUBE.AI. All rights reserved.
