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
  ./node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>&1 | grep -E "✔|Error|already" | head -5 || true
  echo "==> Schema synced"
  node "$API_DIR/seed-demo.js" 2>/dev/null || true
  echo "==> Seed done"
fi

echo "==> Starting API on :$API_PORT..."
PORT=$API_PORT NODE_PATH="$API_DIR/node_modules" \
  node "$API_DIR/dist/main.js" > /tmp/api.log 2>&1 &
API_PID=$!

WAITED=0
while [ $WAITED -lt 60 ]; do
  wget -qO- "http://localhost:$API_PORT/api/v1/health/live" >/dev/null 2>&1 && break
  kill -0 $API_PID 2>/dev/null || { echo "==> API died:"; cat /tmp/api.log | tail -40; exit 1; }
  sleep 2; WAITED=$((WAITED+2))
done
[ $WAITED -ge 60 ] && { echo "==> API timeout:"; cat /tmp/api.log | tail -40; exit 1; }
echo "==> API ready after ${WAITED}s"

echo "==> Starting web on :$WEB_PORT..."
cd "$WEB_DIR"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:$API_PORT}"
exec ./node_modules/.bin/next start -p "$WEB_PORT"
