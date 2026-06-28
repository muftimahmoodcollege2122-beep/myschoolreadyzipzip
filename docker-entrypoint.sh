#!/bin/sh
set -e

API_DIR="/app/final_build/saas_build/apps/api"
WEB_DIR="/app/final_build/saas_build/apps/web"
API_PORT="3001"
WEB_PORT="${PORT:-5000}"

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
