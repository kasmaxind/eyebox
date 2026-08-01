# Deployment Guide — EYEBOX TUBE.AI

## Local development

```bash
./scripts/dev-setup.sh
npm run dev
```

Requires Node 20+, FFmpeg, and MongoDB + Redis (via Docker Compose services `mongo` / `redis`).

## Docker Compose (full stack)

```bash
cp .env.example .env
# Edit JWT secrets, CORS, SMTP, AWS as needed
./scripts/deploy.sh
```

Exposed ports:

| Port | Service |
|------|---------|
| 80 | Nginx (web + API proxy) |
| 3000 | Next.js (direct) |
| 4000 | API (direct) |
| 27017 | MongoDB |
| 6379 | Redis |

## Production checklist

1. Set strong `JWT_*` and `CSRF_SECRET` values
2. `NODE_ENV=production`, `COOKIE_SECURE=true`
3. Point `CORS_ORIGINS` / `SOCKET_CORS_ORIGIN` / `APP_URL` / `API_URL` to real domains
4. Configure TLS on Nginx or a load balancer / CloudFront
5. Set `USE_LOCAL_STORAGE=false` and fill AWS S3 + CloudFront
6. Configure Google OAuth redirect URIs
7. Configure SMTP for OTP / password reset emails
8. Change seeded admin password immediately
9. Optionally set `AI_PROVIDER=openai` + `OPENAI_API_KEY`

## Scaling notes

- Run multiple API replicas behind Nginx; use sticky sessions or Redis adapter for Socket.IO in multi-node setups
- Offload FFmpeg to a worker queue (BullMQ + Redis) for heavy uploads
- Serve media exclusively via CloudFront with short-lived signed URLs for private content
- Enable MongoDB replica set and Redis persistence (`AOF`) for HA

## Health checks

- API: `GET /health`
- Nginx: `GET /nginx-health`
