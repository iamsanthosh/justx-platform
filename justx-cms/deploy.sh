#!/usr/bin/env bash
# Deploys JustX CMS on a Hostinger VPS (Node + PM2 + Nginx + MySQL).
# Run this from the project root, on the VPS, after cloning/pulling the repo
# and creating a real .env from .env.example.
#
# Usage: ./deploy.sh [--first-run]
#   --first-run   also runs `prisma migrate deploy` + `npm run seed`
#                 (only do this once, on a fresh database)

set -euo pipefail

if [ ! -f .env ]; then
  echo "Error: .env not found. Copy .env.example to .env and fill in real values first."
  exit 1
fi

echo "==> Installing dependencies"
npm ci

echo "==> Generating Prisma client"
npx prisma generate

if [[ "${1:-}" == "--first-run" ]]; then
  echo "==> Running database migrations (first run)"
  npx prisma migrate deploy
  echo "==> Seeding initial data (roles, admin user, home page)"
  npm run seed
else
  echo "==> Applying any pending migrations"
  npx prisma migrate deploy
fi

echo "==> Building the application"
npm run build

echo "==> Copying static assets into the standalone build"
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
mkdir -p .next/standalone/public
cp -r public/. .next/standalone/public/

mkdir -p logs

echo "==> Starting/reloading with PM2"
if pm2 describe justx-cms > /dev/null 2>&1; then
  pm2 reload ecosystem.config.js
else
  pm2 start ecosystem.config.js
  pm2 save
fi

echo "==> Done. Check status with: pm2 status justx-cms"
echo "    Logs:                    pm2 logs justx-cms"
