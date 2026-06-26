#!/bin/sh
set -e

API_DIR="/app/apps/api"
WEB_DIR="/app/apps/web"
API_BIN="$API_DIR/node_modules/.bin"
WEB_BIN="$WEB_DIR/node_modules/.bin"

API_PORT="${PORT:-3001}"
WEB_PORT="5000"

echo "==> API will listen on port $API_PORT"

# ── Redis ─────────────────────────────────────────────────────────────────────
echo "==> Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 --loglevel warning
sleep 1
echo "==> Redis ready"

# ── Database ──────────────────────────────────────────────────────────────────
if [ -n "$DATABASE_URL" ]; then
  echo "==> Syncing database schema..."
  cd "$API_DIR"
  "$API_BIN/prisma" db push --skip-generate --accept-data-loss 2>&1 | \
    grep -E "already|applied|✔|Error|warn" | head -5 || true
  echo "==> Schema synced"

  echo "==> Seeding demo tenant..."
  node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
async function seed() {
  const p = new PrismaClient();
  try {
    const ex = await p.tenant.findUnique({ where: { slug: 'demo' } });
    if (ex) { console.log('   Demo already exists'); return; }
    const tid = crypto.randomUUID();
    await p.tenant.create({ data: {
      id: tid, name: 'Demo School', slug: 'demo',
      tier: 'STARTER', status: 'ACTIVE',
      schemaName: 'tenant_demo', dataRegion: 'ap-south-1',
      trialEndsAt: new Date(Date.now() + 365*86400000),
      planLimits: {}, settings: { timezone:'Asia/Karachi', locale:'en', currency:'PKR', academicYear:'2025-2026' }
    }});
    await p.school.create({ data: {
      tenantId: tid, name: 'Demo School', code: 'DEMO',
      address: { country: 'Pakistan' },
      email: 'admin@demo.edu', timezone: 'Asia/Karachi',
      locale: 'en', academicYear: '2025-2026'
    }});
    const hash = await bcrypt.hash('Admin@123456', 12);
    await p.user.create({ data: {
      tenantId: tid, email: 'admin@demo.edu',
      passwordHash: hash, role: 'SCHOOL_ADMIN',
      emailVerified: true,
      profile: { create: { firstName: 'Demo', lastName: 'Admin', phone: '+923001234567' } }
    }});
    console.log('   Seeded: admin@demo.edu / Admin@123456');
  } catch(e) {
    console.log('   Seed note:', e.message.split('\n')[0]);
  } finally { await p.\$disconnect(); }
}
seed();
" 2>/dev/null || true
  echo "==> Demo data ready"
else
  echo "==> WARNING: DATABASE_URL not set — skipping DB steps"
fi

# ── NestJS API ────────────────────────────────────────────────────────────────
echo "==> Starting API on port $API_PORT..."
cd "$API_DIR"
export PORT=$API_PORT

if [ -f "dist/main.js" ]; then
  echo "   Using compiled dist/main.js"
  node dist/main.js > /tmp/api.log 2>&1 &
else
  echo "   No dist/ — using ts-node fallback"
  node \
    -r "$API_DIR/node_modules/ts-node/register/transpile-only" \
    -r "$API_DIR/node_modules/tsconfig-paths/register" \
    src/main.ts > /tmp/api.log 2>&1 &
fi

API_PID=$!
echo "   API PID: $API_PID"

# ── Wait for API ──────────────────────────────────────────────────────────────
echo "==> Waiting for API..."
WAITED=0
while [ $WAITED -lt 90 ]; do
  if wget -qO- "http://localhost:$API_PORT/api/v1/health/live" >/dev/null 2>&1; then
    echo "==> API ready after ${WAITED}s"
    break
  fi
  if ! kill -0 $API_PID 2>/dev/null; then
    echo "==> API process died. Last logs:"
    tail -60 /tmp/api.log
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

if [ $WAITED -ge 90 ]; then
  echo "==> API timed out. Last logs:"
  tail -60 /tmp/api.log
  exit 1
fi

# ── Next.js ───────────────────────────────────────────────────────────────────
echo "==> Starting Next.js on port $WEB_PORT..."
cd "$WEB_DIR"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:$API_PORT}"

if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
  echo "   Using pre-built .next/"
  exec "$WEB_BIN/next" start -p "$WEB_PORT"
else
  echo "   No .next — running dev server"
  exec "$WEB_BIN/next" dev -p "$WEB_PORT"
fi
