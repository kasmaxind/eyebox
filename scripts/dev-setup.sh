#!/usr/bin/env bash
# Local development bootstrap for EYEBOX TUBE.AI
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies"
npm install

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [[ ! -f apps/web/.env.local ]]; then
  cp apps/web/.env.example apps/web/.env.local 2>/dev/null || true
fi

echo "==> Starting MongoDB + Redis (Docker)"
if command -v docker >/dev/null 2>&1; then
  docker compose up -d mongo redis
else
  echo "Docker not found — ensure MongoDB (27017) and Redis (6379) are running locally."
fi

echo "==> Building API"
npm run build:api

echo "==> Seeding database"
npm run seed || echo "Seed failed — is MongoDB up?"

echo ""
echo "Ready. Start development servers:"
echo "  npm run dev"
echo ""
echo "Or separately:"
echo "  npm run dev:api"
echo "  npm run dev:web"
