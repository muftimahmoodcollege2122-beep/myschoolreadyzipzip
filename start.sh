#!/bin/bash
set -e

SAAS_DIR="$(pwd)/final_build/saas_build"

echo "==> Starting Redis..."
REDIS_SERVER=$(nix-shell -p redis --run "which redis-server" 2>/dev/null)
$REDIS_SERVER --daemonize yes --logfile /tmp/redis.log --port 6379
sleep 1
echo "==> Redis started"

echo "==> Starting NestJS API on port 3001 (background)..."
cd "$SAAS_DIR/apps/api"
node \
  -r ts-node/register/transpile-only \
  -r tsconfig-paths/register \
  src/main.ts \
  > /tmp/api.log 2>&1 &
echo "API started in background (logs: /tmp/api.log)"

echo "==> Starting Next.js web on port 5000..."
cd "$SAAS_DIR/apps/web"
./node_modules/.bin/next dev -p 5000
