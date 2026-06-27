#!/bin/sh
set -e

WEB_PORT="${PORT:-5000}"
API_PORT="3001"
API_DIR="/app/final_build/saas_build/apps/api"
WEB_DIR="/app/final_build/saas_build/apps/web"

echo "==> Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 --loglevel warning
sleep 1
echo "==> Redis ready"

if [ -n "$DATABASE_URL" ]; then
  echo "==> Syncing database schema..."
  cd "$API_DIR"
  ./node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>&1 | grep -E "✔|Error|already" | head -5 || true
  echo "==> Schema synced"
  echo "==> Seeding..."
  node "$API_DIR/seed-demo.js" 2>/dev/null || true
  echo "==> Seed done"
else
  echo "==> WARNING: DATABASE_URL not set"
fi

echo "==> Starting API on port $API_PORT..."
PORT=$API_PORT \
NODE_PATH="$API_DIR/node_modules" \
node "$API_DIR/dist/main.js" > /tmp/api.log 2>&1 &
API_PID=$!

echo "==> Waiting for API..."
WAITED=0
while [ $WAITED -lt 60 ]; do
  if wget -qO- "http://localhost:$API_PORT/api/v1/health/live" >/dev/null 2>&1; then
    echo "==> API ready after ${WAITED}s"
    break
  fi
  if ! kill -0 $API_PID 2>/dev/null; then
    echo "==> API died:"
    cat /tmp/api.log | tail -30
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

if [ $WAITED -ge 60 ]; then
  echo "==> API timeout. Logs:"
  cat /tmp/api.log | tail -30
  exit 1
fi

echo "==> Starting web on port $WEB_PORT..."
cd "$WEB_DIR"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:$API_PORT}"

if [ ! -f ".next/BUILD_ID" ]; then
  echo "==> Building Next.js..."
  ./node_modules/.bin/next build 2>&1 | tail -5
fi

exec ./node_modules/.bin/next start -p "$WEB_PORT"
