FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget python3 make g++

# Cache bust
RUN echo "2026-06-27-v3"

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY . .

# ── Install all workspace deps at monorepo root ───────────────────────────────
RUN cd /app/final_build/saas_build && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -5

# Verify core packages present
RUN test -d /app/final_build/saas_build/node_modules/@nestjs/core && \
    echo "nestjs/core OK" || (echo "@nestjs/core MISSING" && exit 1)

RUN test -d /app/final_build/saas_build/node_modules/next && \
    echo "next OK" || (echo "next MISSING" && exit 1)

# ── Prisma generate ───────────────────────────────────────────────────────────
RUN cd /app/final_build/saas_build && \
    ./node_modules/.bin/prisma generate \
    --schema=apps/api/prisma/schema.prisma 2>&1 | tail -5 || \
    echo "Prisma generate skipped (engine not available in build env)"

# ── Build API (NestJS → dist/) ────────────────────────────────────────────────
RUN cd /app/final_build/saas_build/apps/api && \
    /app/final_build/saas_build/node_modules/.bin/tsc \
    -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -8

RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "API build OK" || (echo "API build FAILED - dist/main.js missing" && exit 1)

# ── Build Next.js web app ─────────────────────────────────────────────────────
# Use the installed next binary from node_modules — never npx (downloads wrong version)
RUN cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    /app/final_build/saas_build/node_modules/.bin/next build 2>&1 | tail -15 || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
