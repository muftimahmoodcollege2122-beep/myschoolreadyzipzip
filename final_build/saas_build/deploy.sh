#!/usr/bin/env bash
# =============================================================================
#  EduOS Production Deployment Script
#  Usage: ./deploy.sh [--mode pm2|docker] [--skip-build]
# =============================================================================

set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MODE="pm2"
SKIP_BUILD=false

for arg in "$@"; do
  case $arg in
    --mode=pm2)   MODE="pm2"    ;;
    --mode=docker) MODE="docker" ;;
    --skip-build) SKIP_BUILD=true ;;
  esac
done

log()  { echo -e "${BLUE}[EduOS]${NC} $*"; }
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
die()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# ── Pre-flight checks ──────────────────────────────────────────────────────────
log "EduOS Deployment — Mode: ${MODE} | $(date)"

[ -f .env ] || die ".env file not found. Copy .env.example to .env and fill in values."
# shellcheck source=/dev/null
source .env

command -v node  >/dev/null 2>&1 || die "Node.js is required"
command -v npm   >/dev/null 2>&1 || die "npm is required"

if [ "$MODE" = "pm2" ]; then
  command -v pm2 >/dev/null 2>&1 || { npm install -g pm2; ok "PM2 installed"; }
fi
if [ "$MODE" = "docker" ]; then
  command -v docker >/dev/null 2>&1 || die "Docker is required"
  command -v docker-compose >/dev/null 2>&1 || die "docker-compose is required"
fi

# ── Install dependencies ───────────────────────────────────────────────────────
log "Installing dependencies..."
npm install --production=false
ok "Dependencies installed"

# ── Database migrations ────────────────────────────────────────────────────────
log "Running database migrations..."
(cd apps/api && npx prisma migrate deploy && npx prisma generate)
ok "Database migrations complete"

# ── Build ─────────────────────────────────────────────────────────────────────
if [ "$SKIP_BUILD" = false ]; then
  log "Building all apps..."

  log "  Building API..."
  (cd apps/api && npm run build)
  ok "  API built"

  for app in web admin teacher student parent; do
    log "  Building ${app} portal..."
    (cd "apps/${app}" && npm run build)
    ok "  ${app} portal built"
  done
  ok "All builds complete"
else
  warn "Skipping build (--skip-build)"
fi

# ── Deploy ────────────────────────────────────────────────────────────────────
if [ "$MODE" = "pm2" ]; then
  log "Deploying with PM2..."
  mkdir -p logs

  pm2 describe eduos-api >/dev/null 2>&1 && pm2 reload eduos-api || true
  pm2 start ecosystem.config.js --env production

  pm2 save
  ok "PM2 deployment complete"
  echo ""
  pm2 list

elif [ "$MODE" = "docker" ]; then
  log "Deploying with Docker Compose..."

  docker-compose pull 2>/dev/null || true
  docker-compose build --parallel
  docker-compose up -d --remove-orphans

  log "Waiting for services to be healthy..."
  sleep 10
  docker-compose ps
  ok "Docker deployment complete"
fi

# ── Post-deploy health check ───────────────────────────────────────────────────
log "Health check..."
sleep 5

for port in 4000 3000 3001 3002 3003 3004; do
  name=$(case $port in 4000) echo "API";; 3000) echo "Web";; 3001) echo "Admin";; 3002) echo "Teacher";; 3003) echo "Student";; 3004) echo "Parent";; esac)
  if curl -sf "http://localhost:${port}" >/dev/null 2>&1 || curl -sf "http://localhost:${port}/api/v1/health" >/dev/null 2>&1; then
    ok "${name} (port ${port}) is up"
  else
    warn "${name} (port ${port}) may not be ready yet"
  fi
done

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           EduOS Deployment Complete! 🚀              ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  🌐 Marketing:  https://myschool.pk                  ║${NC}"
echo -e "${GREEN}║  🏫 Admin:      https://admin.myschool.pk            ║${NC}"
echo -e "${GREEN}║  👨‍🏫 Teacher:    https://teach.myschool.pk            ║${NC}"
echo -e "${GREEN}║  👩‍🎓 Student:    https://learn.myschool.pk            ║${NC}"
echo -e "${GREEN}║  👨‍👩‍👧 Parent:     https://parent.myschool.pk           ║${NC}"
echo -e "${GREEN}║  ⚙️  API:        https://api.myschool.pk              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
