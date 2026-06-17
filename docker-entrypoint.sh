#!/bin/sh
set -e

SAAS_DIR="/app"
API_DIR="$SAAS_DIR/apps/api"
WEB_DIR="$SAAS_DIR/apps/web"
BIN="$SAAS_DIR/node_modules/.bin"

echo "==> Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 2>/dev/null || true
sleep 1
echo "==> Redis started"

echo "==> Pushing database schema..."
cd "$API_DIR"
"$BIN/prisma" db push --skip-generate 2>&1 | grep -E "✔|🚀|Error|error|already|warn" | head -5 || true
echo "==> Database schema synced"

echo "==> Seeding demo tenant..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
async function seed() {
  const p = new PrismaClient();
  try {
    const existing = await p.tenant.findUnique({ where: { slug: 'demo' } });
    if (existing) { console.log('   Demo tenant exists'); return; }
    const tid = crypto.randomUUID();
    await p.tenant.create({ data: { id: tid, name: 'Demo School', slug: 'demo', tier: 'STARTER', status: 'ACTIVE', schemaName: 'tenant_demo', dataRegion: 'ap-south-1', trialEndsAt: new Date(Date.now() + 365*24*3600*1000), planLimits: {}, settings: { timezone: 'Asia/Karachi', locale: 'en', currency: 'PKR', academicYear: '2025-2026' } } });
    await p.school.create({ data: { tenantId: tid, name: 'Demo School', code: 'DEMO', address: { country: 'Pakistan' }, email: 'admin@demo.edu', timezone: 'Asia/Karachi', locale: 'en', academicYear: '2025-2026' } });
    const hash = await bcrypt.hash('Admin@123456', 12);
    await p.user.create({ data: { tenantId: tid, email: 'admin@demo.edu', passwordHash: hash, role: 'SCHOOL_ADMIN', emailVerified: true, profile: { create: { firstName: 'Demo', lastName: 'Admin', phone: '+923001234567' } } } });
    console.log('   Demo seeded: admin@demo.edu / Admin@123456');
  } catch(e) { console.log('   Seed note:', e.message.split('\n')[0]); }
  await p.\$disconnect();
}
seed();
" 2>/dev/null || true
echo "==> Demo data ready"

echo "==> Starting NestJS API on port 3001..."
cd "$API_DIR"
if [ -d "dist" ]; then
  node dist/main.js &
else
  NODE_PATH="$SAAS_DIR/node_modules" \
  node \
    -r "$SAAS_DIR/node_modules/ts-node/register/transpile-only" \
    -r "$SAAS_DIR/node_modules/tsconfig-paths/register" \
    src/main.ts &
fi
API_PID=$!
echo "==> API started (PID: $API_PID)"

echo "==> Waiting for API..."
for i in $(seq 1 40); do
  if wget -qO- http://localhost:3001/api/v1/health/live >/dev/null 2>&1; then
    echo "==> API ready"; break
  fi
  sleep 2
done

echo "==> Starting Next.js web on port 5000..."
cd "$WEB_DIR"
export NEXT_PUBLIC_API_URL="${API_URL:-http://localhost:3001}"
if [ -d ".next" ]; then
  "$BIN/next" start -p 5000
else
  "$BIN/next" dev -p 5000
fi
