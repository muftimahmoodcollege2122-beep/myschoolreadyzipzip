#!/bin/sh
set -e

SAAS_DIR="/app/final_build/saas_build"
API_DIR="$SAAS_DIR/apps/api"
WEB_DIR="$SAAS_DIR/apps/web"
BINS="$SAAS_DIR/node_modules/.bin"

# API on fixed internal port (never conflicts with Railway's PORT)
API_PORT="3099"
# Next.js on Railway's assigned PORT (external traffic comes here)
WEB_PORT="${PORT:-3001}"

echo "==> Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 --loglevel warning
sleep 1
echo "==> Redis ready"

if [ -n "$DATABASE_URL" ]; then
  echo "==> Syncing schema..."
  cd "$API_DIR"
  NODE_PATH="$SAAS_DIR/node_modules" \
    "$BINS/prisma" db push \
    --schema=prisma/schema.prisma \
    --skip-generate --accept-data-loss 2>&1 | grep -E "✔|Error|already|sync" | head -5 || true
  echo "==> Schema synced"

  echo "==> Seeding..."
  NODE_PATH="$SAAS_DIR/node_modules" node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
async function seed() {
  const p = new PrismaClient();
  try {
    const ex = await p.tenant.findUnique({ where: { slug: 'demo' } });
    if (ex) { console.log('   Already seeded'); return; }
    const tid = crypto.randomUUID();
    await p.tenant.create({ data: {
      id: tid, name: 'Demo School', slug: 'demo', tier: 'STARTER', status: 'ACTIVE',
      schemaName: 'tenant_demo', dataRegion: 'ap-south-1',
      trialEndsAt: new Date(Date.now() + 365*86400000), planLimits: {},
      settings: { timezone:'Asia/Karachi', locale:'en', currency:'PKR', academicYear:'2025-2026' }
    }});
    await p.school.create({ data: {
      tenantId: tid, name: 'Demo School', code: 'DEMO',
      address: { country:'Pakistan' }, email: 'admin@demo.edu',
      timezone: 'Asia/Karachi', locale: 'en', academicYear: '2025-2026'
    }});
    const hash = await bcrypt.hash('Admin@123456', 12);
    await p.user.create({ data: {
      tenantId: tid, email: 'admin@demo.edu', passwordHash: hash,
      role: 'SCHOOL_ADMIN', emailVerified: true,
      profile: { create: { firstName:'Demo', lastName:'Admin', phone:'+923001234567' } }
    }});
    console.log('   Seeded: admin@demo.edu / Admin@123456');
  } catch(e) { console.log('   Seed:', e.message.split('\n')[0]); }
  finally { await p.\$disconnect(); }
}
seed();
" 2>/dev/null || true
  echo "==> Seed done"
fi

echo "==> Starting API on :$API_PORT..."
cd "$API_DIR"
PORT=$API_PORT \
NODE_PATH="$SAAS_DIR/node_modules" \
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
# API_INTERNAL_URL: server-only var, used by next.config.js rewrites
# Points to the internal API port (NOT the public URL — that would loop)
export API_INTERNAL_URL="http://127.0.0.1:$API_PORT"

if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
  exec "$BINS/next" start -p "$WEB_PORT"
else
  exec "$BINS/next" dev -p "$WEB_PORT"
fi
