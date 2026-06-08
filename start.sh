#!/bin/bash
set -e

SAAS_DIR="$(pwd)/saas_build"
API_DIR="$SAAS_DIR/apps/api"
WEB_DIR="$SAAS_DIR/apps/web"

echo "==> Starting Redis..."
redis-server --daemonize yes --logfile /tmp/redis.log --port 6379 2>/dev/null || \
  nix-shell -p redis --run "redis-server --daemonize yes --logfile /tmp/redis.log --port 6379" 2>/dev/null || true
sleep 1
echo "==> Redis started"

echo "==> Setting CORS origins..."
REPLIT_DOMAIN="${REPLIT_DEV_DOMAIN:-localhost:5000}"
export CORS_ORIGINS="http://localhost:5000,https://${REPLIT_DOMAIN},http://${REPLIT_DOMAIN}"

echo "==> Generating Prisma Client..."
cd "$API_DIR"
node_modules/.bin/prisma generate 2>&1 | grep -v "^$" | grep -v "Update available" | grep -v "This is a major" | grep -v "Run the following" | grep -v "npm i " | grep -v "└" | grep -v "│" | tail -3
echo "==> Prisma client ready"

echo "==> Pushing database schema..."
node_modules/.bin/prisma db push --skip-generate 2>&1 | grep -E "✔|🚀|Error|error|already|warn" | head -5 || true
echo "==> Database schema synced"

echo "==> Seeding demo tenant (if needed)..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
async function seed() {
  const p = new PrismaClient();
  try {
    const existing = await p.tenant.findUnique({ where: { slug: 'demo' } });
    if (existing) { console.log('   Demo tenant already exists'); return; }
    const tid = crypto.randomUUID();
    await p.tenant.create({ data: { id: tid, name: 'Demo School', slug: 'demo', tier: 'STARTER', status: 'ACTIVE', schemaName: 'tenant_demo', dataRegion: 'ap-south-1', trialEndsAt: new Date(Date.now() + 365*24*3600*1000), planLimits: {}, settings: { timezone: 'Asia/Karachi', locale: 'en', currency: 'PKR', academicYear: '2025-2026' } } });
    await p.school.create({ data: { tenantId: tid, name: 'Demo School', code: 'DEMO', address: { country: 'Pakistan' }, email: 'admin@demo.edu', timezone: 'Asia/Karachi', locale: 'en', academicYear: '2025-2026' } });
    const hash = await bcrypt.hash('Admin@123456', 12);
    await p.user.create({ data: { tenantId: tid, email: 'admin@demo.edu', passwordHash: hash, role: 'SCHOOL_ADMIN', emailVerified: true, profile: { create: { firstName: 'Demo', lastName: 'Admin', phone: '+923001234567' } } } });
    console.log('   Demo tenant seeded: slug=demo, email=admin@demo.edu, pw=Admin@123456');
  } catch(e) { console.log('   Seed note:', e.message.split('\n')[0]); }
  await p.\$disconnect();
}
seed();
" 2>/dev/null
echo "==> Demo data ready"

echo "==> Starting NestJS API on port 3001 (background)..."
cd "$API_DIR"
node \
  -r ts-node/register/transpile-only \
  -r tsconfig-paths/register \
  src/main.ts \
  > /tmp/api.log 2>&1 &
API_PID=$!
echo "API started in background (PID: $API_PID, logs: /tmp/api.log)"

echo "==> Waiting for API to be ready..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/v1/health/live >/dev/null 2>&1; then
    echo "==> API is ready"
    break
  fi
  sleep 2
done

echo "==> Starting Next.js web on port 5000..."
cd "$WEB_DIR"
export NEXT_PUBLIC_API_URL="http://localhost:3001"
if [ "$NODE_ENV" = "production" ]; then
  echo "   Building for production..."
  ./node_modules/.bin/next build 2>&1 | tail -5
  echo "   Starting production server..."
  ./node_modules/.bin/next start -p 5000
else
  ./node_modules/.bin/next dev -p 5000
fi
