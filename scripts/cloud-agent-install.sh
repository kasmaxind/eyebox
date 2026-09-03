#!/usr/bin/env bash
# Idempotent Cloud Agent install for Eyebox (Next.js).
# Safe on empty checkouts that have no package.json yet.
set -euo pipefail

if [[ ! -f package.json ]]; then
  echo "skip install: no package.json in $(pwd)"
  exit 0
fi

if [[ -f package-lock.json ]]; then
  npm ci || npm install
else
  npm install
fi

echo "install complete"
