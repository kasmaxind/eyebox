# EYEBOX TUBE.AI — API Documentation

**Base URL:** `http://localhost:4000/api/v1`  
**Auth:** Bearer JWT (`Authorization: Bearer <accessToken>`) and/or httpOnly cookies  
**Content-Type:** `application/json` (multipart for uploads)

## Response envelope

```json
{
  "success": true,
  "data": {},
  "message": "optional",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "nextCursor": "optional-cursor"
  }
}
```

Errors:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness / readiness |

---

## CSRF

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/csrf-token` | No | Issues CSRF token cookie + body |

Send token back via `X-CSRF-Token` header on mutating requests when CSRF is enabled.

---

## Authentication `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register with email, password, name |
| POST | `/auth/login` | No | Login → access + refresh tokens |
| POST | `/auth/logout` | Yes | Invalidate current device session |
| POST | `/auth/refresh` | Cookie/Body | Rotate refresh → new access token |
| POST | `/auth/verify-otp` | No | Verify email OTP |
| POST | `/auth/resend-otp` | No | Resend OTP |
| POST | `/auth/forgot-password` | No | Request reset |
| POST | `/auth/reset-password` | No | Reset with token |
| GET | `/auth/google` | No | Start Google OAuth |
| GET | `/auth/google/callback` | No | OAuth callback |
| GET | `/auth/me` | Yes | Current user + channel |
| GET | `/auth/devices` | Yes | List active devices |
| DELETE | `/auth/devices/:deviceId` | Yes | Revoke device |

### Register body

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "name": "Alex Creator"
}
```

### Login body

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "deviceName": "Chrome on Linux"
}
```

---

## Videos `/videos`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/videos/feed` | Optional | Infinite home feed (`cursor`, `limit`) |
| GET | `/videos/trending` | Optional | Trending |
| GET | `/videos/shorts` | Optional | Short-form |
| GET | `/videos/live` | Optional | Live streams |
| GET | `/videos/category/:slug` | Optional | By category |
| GET | `/videos/:id` | Optional | Detail + view increment |
| GET | `/videos/:id/related` | Optional | Related |
| POST | `/videos` | Creator+ | Create metadata draft |
| PATCH | `/videos/:id` | Owner | Update metadata |
| DELETE | `/videos/:id` | Owner/Admin | Soft delete |
| POST | `/videos/:id/like` | Yes | Like |
| POST | `/videos/:id/dislike` | Yes | Dislike |
| DELETE | `/videos/:id/reaction` | Yes | Remove reaction |
| POST | `/videos/:id/report` | Yes | Report |
| POST | `/videos/:id/watch` | Yes | Record watch progress |

---

## Upload `/upload`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload/init` | Creator+ | Start resumable session |
| POST | `/upload/chunk` | Creator+ | Upload chunk (`multipart`) |
| POST | `/upload/complete` | Creator+ | Finish + queue FFmpeg |
| POST | `/upload/thumbnail` | Creator+ | Custom thumbnail |
| GET | `/upload/progress/:uploadId` | Creator+ | Processing progress |

### Init body

```json
{
  "filename": "talk.mp4",
  "mimeType": "video/mp4",
  "size": 104857600,
  "title": "My Talk"
}
```

---

## Comments `/comments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/comments/video/:videoId` | Optional | List (threaded) |
| POST | `/comments` | Yes | Create / reply |
| PATCH | `/comments/:id` | Owner | Edit |
| DELETE | `/comments/:id` | Owner/Mod | Delete |
| POST | `/comments/:id/like` | Yes | Like comment |
| POST | `/comments/:id/pin` | Creator | Pin |
| POST | `/comments/:id/heart` | Creator | Heart |

---

## Playlists `/playlists`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/playlists/me` | Yes | My playlists |
| GET | `/playlists/:id` | Optional | Get playlist |
| POST | `/playlists` | Yes | Create |
| PATCH | `/playlists/:id` | Owner | Update |
| DELETE | `/playlists/:id` | Owner | Delete |
| POST | `/playlists/:id/videos` | Owner | Add video |
| DELETE | `/playlists/:id/videos/:videoId` | Owner | Remove |

Visibility: `public` | `private` | `unlisted`. Set `collaborative: true` for collab playlists.

---

## Subscriptions `/subscriptions`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/subscriptions` | Yes | My subscriptions |
| POST | `/subscriptions/:channelId` | Yes | Subscribe |
| DELETE | `/subscriptions/:channelId` | Yes | Unsubscribe |
| PATCH | `/subscriptions/:channelId` | Yes | Toggle notifications |

---

## Channels `/channels`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/channels/:handle` | Optional | Public channel |
| GET | `/channels/:handle/videos` | Optional | Channel videos |
| PATCH | `/channels/me` | Creator+ | Update branding |
| POST | `/channels/me/banner` | Creator+ | Upload banner |
| POST | `/channels/me/logo` | Creator+ | Upload logo |

---

## Search `/search`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search?q=` | Optional | Full search |
| GET | `/search/suggest?q=` | Optional | Instant suggestions |

**Filters:** `date`, `duration`, `category`, `channel`, `sort` (`relevance` \| `views` \| `date` \| `rating`)

---

## Recommendations `/recommendations`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/recommendations` | Optional | Personalized / AI feed |
| GET | `/recommendations/home` | Optional | Home sections payload |

---

## Notifications `/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Yes | List |
| PATCH | `/notifications/:id/read` | Yes | Mark read |
| POST | `/notifications/read-all` | Yes | Mark all read |

Realtime via Socket.IO event `notification:new`.

---

## Analytics `/analytics`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/video/:id` | Owner | Video analytics |
| GET | `/analytics/channel` | Creator | Channel overview |
| GET | `/analytics/realtime` | Creator | Realtime stats |

---

## Live `/live`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/live/start` | Creator+ | Start live |
| POST | `/live/:id/end` | Owner | End live |
| GET | `/live` | Optional | Active lives |
| Socket | `live:chat` | Optional | Room chat |

---

## Premium `/premium`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/premium/plans` | No | Plans |
| POST | `/premium/subscribe` | Yes | Start subscription |
| GET | `/premium/status` | Yes | Membership status |

---

## Admin `/admin` (role: admin | moderator)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/dashboard` | Admin | KPIs |
| GET | `/admin/users` | Admin | List / search users |
| PATCH | `/admin/users/:id` | Admin | Ban / role / verify |
| GET | `/admin/videos` | Mod+ | Moderate videos |
| PATCH | `/admin/videos/:id` | Mod+ | Take down / restore |
| GET | `/admin/channels` | Admin | Channels |
| GET | `/admin/reports` | Mod+ | Reports queue |
| PATCH | `/admin/reports/:id` | Mod+ | Resolve |
| GET | `/admin/analytics` | Admin | Platform analytics |
| CRUD | `/admin/ads` | Admin | Advertisements |
| GET | `/admin/audit` | Admin | Audit logs |

---

## Categories `/categories`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/categories` | No | List |
| POST | `/categories` | Admin | Create |

---

## Socket.IO events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `notification:new` | Server → Client | New notification |
| `upload:progress` | Server → Client | Transcode progress |
| `live:join` | Client → Server | Join live room |
| `live:chat` | Bidirectional | Live chat message |
| `live:leave` | Client → Server | Leave room |

Connect to `NEXT_PUBLIC_SOCKET_URL` with auth token in `auth.token` or cookie.

---

## Rate limits

- Global: ~200 req / 15 min (configurable)
- Auth routes: stricter (~20 / window)
- Nginx additional burst limits on `/api/` and `/api/v1/auth/`

---

## Roles

`user` → `creator` → `moderator` → `admin`

Guests may browse public content without authentication.
