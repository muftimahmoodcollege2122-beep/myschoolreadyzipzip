#!/bin/sh

API_DIR="/app/final_build/saas_build/apps/api"
WEB_DIR="/app/final_build/saas_build/apps/web"
API_PORT="3001"
WEB_PORT="${PORT:-5000}"

echo "======================================================"
echo "DIAGNOSTIC REPORT - $(date)"
echo "======================================================"

echo ""
echo "--- SYSTEM ---"
node --version
npm --version
redis-server --version | head -1
df -h / | tail -1
free -m | grep Mem

echo ""
echo "--- ENV VARS ---"
echo "PORT=$PORT"
echo "DATABASE_URL=$([ -n "$DATABASE_URL" ] && echo SET || echo NOT_SET)"
echo "JWT_SECRET=$([ -n "$JWT_SECRET" ] && echo SET || echo NOT_SET)"
echo "NODE_ENV=$NODE_ENV"
echo "RAILWAY_PUBLIC_DOMAIN=$RAILWAY_PUBLIC_DOMAIN"

echo ""
echo "--- FILE CHECKS ---"
test -f "$API_DIR/dist/main.js"  && echo "✅ dist/main.js"        || echo "❌ dist/main.js MISSING"
test -d "$API_DIR/node_modules/@nestjs/core" && echo "✅ @nestjs/core"  || echo "❌ @nestjs/core MISSING"
test -d "$API_DIR/node_modules/@prisma"      && echo "✅ @prisma"       || echo "❌ @prisma MISSING"
test -d "$WEB_DIR/node_modules/next"         && echo "✅ next"          || echo "❌ next MISSING"
test -d "$WEB_DIR/node_modules/@tanstack"    && echo "✅ @tanstack"     || echo "❌ @tanstack MISSING"
test -f "$WEB_DIR/.next/BUILD_ID"            && echo "✅ .next built"   || echo "❌ .next NOT BUILT"

echo ""
echo "--- STARTING REDIS ---"
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 --loglevel warning
sleep 1
redis-cli ping && echo "✅ Redis OK" || echo "❌ Redis FAILED"

echo ""
echo "--- DATABASE ---"
if [ -n "$DATABASE_URL" ]; then
  cd "$API_DIR"
  ./node_modules/.bin/prisma db push --skip-generate --accept-data-loss 2>&1 | tail -5 || echo "❌ Prisma push failed"
  node "$API_DIR/seed-demo.js" 2>&1 | tail -3 || echo "⚠️ Seed failed (non-fatal)"
else
  echo "⚠️ DATABASE_URL not set — skipping"
fi

echo ""
echo "--- STARTING API on :$API_PORT ---"
PORT=$API_PORT NODE_PATH="$API_DIR/node_modules" \
  node "$API_DIR/dist/main.js" > /tmp/api.log 2>&1 &
API_PID=$!

WAITED=0
while [ $WAITED -lt 60 ]; do
  wget -qO- "http://localhost:$API_PORT/api/v1/health/live" >/dev/null 2>&1 && break
  kill -0 $API_PID 2>/dev/null || break
  sleep 2; WAITED=$((WAITED+2))
done

if wget -qO- "http://localhost:$API_PORT/api/v1/health/live" >/dev/null 2>&1; then
  echo "✅ API ready after ${WAITED}s"
else
  echo "❌ API FAILED after ${WAITED}s — full logs:"
  cat /tmp/api.log
fi

echo ""
echo "--- STARTING WEB on :$WEB_PORT ---"
cd "$WEB_DIR"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:$API_PORT}"
echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

exec ./node_modules/.bin/next start -p "$WEB_PORT" 2>&1
