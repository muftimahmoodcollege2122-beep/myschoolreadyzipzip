#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# docker-entrypoint.sh — MySchool container startup script
# ─────────────────────────────────────────────────────────────────────────────
# Execution order:
#   1. Start Redis (daemonized on port 6379)
#   2. Run Prisma migration (db push) to sync DB schema
#   3. Run seed-demo.js — creates demo school tenant if not exists
#   3b. Run prisma/seed.ts — ensures the platform tenant + SUPER_ADMIN account
#       exist (idempotent, safe to run on every deploy — see prisma/seed.ts)
#   4. Start NestJS API on port 3001 (background process)
#   5. Poll /api/v1/health/live until API is ready (max 60s)
#      → if API dies during startup, prints last 40 log lines and exits
#   6. Start Next.js production server on port 3000 (foreground — keeps container alive)
#
# Environment variables required:
#   DATABASE_URL  — PostgreSQL connection string
#   JWT_ACCESS_SECRET  — 64-char random string
#   JWT_REFRESH_SECRET — 64-char random string
#   NODE_ENV=production
#
# Environment variables recommended (super admin login):
#   SUPER_ADMIN_EMAIL    — your login email (default: admin@platform.internal)
#   SUPER_ADMIN_PASSWORD — your login password (default: randomly generated
#                           and printed once to this container's logs on first
#                           deploy — set this explicitly instead so you know it
#                           without digging through Railway logs)
# ─────────────────────────────────────────────────────────────────────────────
set -e

API_DIR="/app/final_build/saas_build/apps/api"
WEB_DIR="/app/final_build/saas_build/apps/web"
API_PORT="3099"
WEB_PORT="${PORT:-3001}"

echo "==> Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 --loglevel warning
sleep 1
echo "==> Redis ready"

if [ -n "$DATABASE_URL" ]; then
  echo "==> Syncing schema..."
  cd "$API_DIR"
  ./node_modules/.bin/prisma db push \
    --schema=prisma/schema.prisma \
    --skip-generate --accept-data-loss 2>&1 | grep -E "✔|Error|already|sync" | head -5 || true
  echo "==> Schema synced"

  echo "==> Seeding..."
  node "$API_DIR/seed-demo.js" 2>&1 | tail -3 || true
  echo "==> Seed done"

  echo "==> Ensuring platform super admin exists..."
  cd "$API_DIR"
  ./node_modules/.bin/ts-node --transpile-only prisma/seed.ts 2>&1 | tail -10 || true
  echo "==> Super admin check done"
fi

echo "==> Starting API on :$API_PORT..."
cd "$API_DIR"
PORT=$API_PORT \
REDIS_HOST=127.0.0.1 \
REDIS_PORT=6379 \
  node dist/main.js > /tmp/api.log 2>&1 &
API_PID=$!

WAITED=0
while [ $WAITED -lt 60 ]; do
  wget -qO- "http://127.0.0.1:$API_PORT/api/v1/health/live" >/dev/null 2>&1 && break
  kill -0 $API_PID 2>/dev/null || { echo "==> API died:"; cat /tmp/api.log; exit 1; }
  sleep 2; WAITED=$((WAITED+2))
done
[ $WAITED -ge 60 ] && { echo "==> API timeout:"; cat /tmp/api.log; exit 1; }
echo "==> API ready after ${WAITED}s"

echo "==> Starting web on :$WEB_PORT..."
cd "$WEB_DIR"
export API_INTERNAL_URL="http://127.0.0.1:$API_PORT"
exec ./node_modules/.bin/next start -p "$WEB_PORT"
