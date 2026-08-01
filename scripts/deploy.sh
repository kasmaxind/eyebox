#!/usr/bin/env bash
# Deploy EYEBOX TUBE.AI with Docker Compose
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> EYEBOX TUBE.AI deploy"

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
  echo "WARNING: Update secrets in .env before production use."
fi

echo "==> Building & starting services"
docker compose pull || true
docker compose up -d --build

echo "==> Waiting for API health..."
for i in {1..60}; do
  if curl -fsS http://localhost:4000/health >/dev/null 2>&1; then
    echo "API is healthy."
    break
  fi
  sleep 2
  if [[ $i -eq 60 ]]; then
    echo "API health check timed out."
    docker compose logs api --tail=80
    exit 1
  fi
done

echo "==> Seeding database (idempotent)"
docker compose exec -T api node -e "
  const { spawn } = require('child_process');
  const p = spawn('npx', ['tsx', 'src/seeds/seed.ts'], { cwd: '/app/apps/api', stdio: 'inherit', shell: true });
  p.on('exit', (c) => process.exit(c || 0));
" 2>/dev/null || docker compose exec -T api npm run seed -w @eyebox/api || echo "Seed skipped — run manually: docker compose exec api npm run seed"

echo ""
echo "EYEBOX TUBE.AI is up:"
echo "  Web:    http://localhost:3000"
echo "  API:    http://localhost:4000"
echo "  Nginx:  http://localhost"
echo "  Health: http://localhost:4000/health"
echo ""
echo "Default admin: admin@eyebox.ai / Admin@Eyebox2026!"
