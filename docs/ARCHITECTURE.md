# Architecture

## Overview

EYEBOX TUBE.AI is a monorepo with two applications:

- `apps/web` — Next.js 15 (App Router) + React 19 frontend
- `apps/api` — Express.js + TypeScript API with Socket.IO

Supporting infra: MongoDB, Redis, Nginx, Docker Compose, local or AWS S3 storage, FFmpeg processing.

```
┌────────────┐     ┌─────────┐     ┌──────────────────────┐
│  Browser   │────▶│  Nginx  │────▶│  Next.js (web:3000)  │
└────────────┘     │  :80    │     └──────────────────────┘
                   │         │     ┌──────────────────────┐
                   │         │────▶│  Express (api:4000)  │
                   └─────────┘     │  + Socket.IO         │
                                   └─────────┬────────────┘
                         ┌───────────────────┼────────────┐
                         ▼                   ▼            ▼
                    ┌─────────┐         ┌─────────┐  ┌────────┐
                    │ MongoDB │         │  Redis  │  │ FFmpeg │
                    └─────────┘         └─────────┘  └────────┘
                                              │
                                         ┌────▼────┐
                                         │ S3/Local│
                                         └─────────┘
```

## Backend layers

1. **Routes** — HTTP wiring, validation chains
2. **Controllers** — request/response orchestration
3. **Services** — business logic (auth, video, AI, FFmpeg, S3)
4. **Models** — Mongoose schemas + indexes
5. **Middleware** — auth, roles, rate limit, CSRF, audit, uploads
6. **Sockets** — live chat, notifications, upload progress

## Auth flow

1. Register/login issues short-lived **access JWT** + long-lived **refresh JWT**
2. Refresh token is hashed and stored per device on the user document
3. Cookies (httpOnly) + Authorization header supported
4. `/auth/refresh` rotates tokens; `/auth/devices` lists/revokes sessions

## Media pipeline

1. `POST /upload/init` → upload session id
2. Chunked `POST /upload/chunk` (Multer)
3. `POST /upload/complete` → FFmpeg quality ladder (360–2160 based on source)
4. Auto thumbnails via FFmpeg + Sharp
5. Files stored under local `uploads/` or S3; CDN URL via CloudFront when configured

## AI (heuristic)

Default `AI_PROVIDER=heuristic`:

- Personalized recommendations from history, likes, subscriptions, tags
- Search ranking boosts
- Summary / chapter generation
- Comment spam scoring
- Content classification & view-velocity trend signals

Set `AI_PROVIDER=openai` + `OPENAI_API_KEY` to extend with LLM calls.

## Frontend

- App Router route groups: `(main)`, `studio`, `admin`, `auth`
- Redux Toolkit: auth, UI chrome, mini-player
- React Query: server state with demo fallbacks when API is offline
- Video.js player with custom cyan/void skin
- PWA manifest for installable shell

## Roles

`user` → `creator` → `moderator` → `admin`

Guests can browse public feeds; mutations require auth; studio requires creator+; admin panel requires moderator/admin.
