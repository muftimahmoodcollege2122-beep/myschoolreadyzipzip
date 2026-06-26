#!/bin/sh
set -e

API_PORT="${PORT:-3001}"
WEB_PORT="5000"

echo "==> Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 --loglevel warning
sleep 1
echo "==> Redis ready"

if [ -n "$DATABASE_URL" ]; then
  echo "==> Syncing database schema..."
  cd /app/apps/api
  ./node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>&1 | grep -E "✔|Error|warn|already" | head -5 || true
  echo "==> Schema synced"

  echo "==> Seeding demo tenant..."
  node /app/apps/api/seed-demo.js 2>/dev/null || true
  echo "==> Demo data ready"
else
  echo "==> WARNING: DATABASE_URL not set"
fi

echo "==> Starting API on port $API_PORT..."
export PORT=$API_PORT

echo "   Using compiled dist/main.js"
# Use NODE_PATH to explicitly tell node where node_modules are
NODE_PATH=/app/apps/api/node_modules node /app/apps/api/dist/main.js > /tmp/api.log 2>&1 &
API_PID=$!
echo "   API PID: $API_PID"

echo "==> Waiting for API..."
WAITED=0
while [ $WAITED -lt 90 ]; do
  if wget -qO- "http://localhost:$API_PORT/api/v1/health/live" >/dev/null 2>&1; then
    echo "==> API ready after ${WAITED}s"
    break
  fi
  if ! kill -0 $API_PID 2>/dev/null; then
    echo "==> API process died. Last logs:"
    cat /tmp/api.log | tail -50
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

if [ $WAITED -ge 90 ]; then
  echo "==> API timeout. Last logs:"
  cat /tmp/api.log | tail -50
  exit 1
fi

echo "==> Starting Next.js on port $WEB_PORT..."
cd /app/apps/web
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:$API_PORT}"

if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
  exec ./node_modules/.bin/next start -p "$WEB_PORT"
else
  exec ./node_modules/.bin/next dev -p "$WEB_PORT"
fi
