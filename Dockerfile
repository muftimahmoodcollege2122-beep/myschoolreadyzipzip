FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget python3 make g++

# Cache bust
RUN echo "2026-06-27-v4"

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Enable yarn via corepack (Node 20 built-in, no download needed)
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY . .

# ── Install all workspace deps with yarn ──────────────────────────────────────
# yarn is reliable on alpine — npm has a known "Exit handler never called" bug
RUN cd /app/final_build/saas_build && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    yarn install --frozen-lockfile --ignore-scripts --non-interactive 2>&1 | tail -5 || \
    yarn install --ignore-scripts --non-interactive 2>&1 | tail -5

# Verify key packages are present
RUN test -d /app/final_build/saas_build/node_modules/@nestjs/core && \
    echo "@nestjs/core OK" || (echo "@nestjs/core MISSING — install failed" && exit 1)

RUN test -d /app/final_build/saas_build/node_modules/next && \
    echo "next OK" || (echo "next MISSING — install failed" && exit 1)

# ── Prisma generate ───────────────────────────────────────────────────────────
RUN cd /app/final_build/saas_build && \
    ./node_modules/.bin/prisma generate \
    --schema=apps/api/prisma/schema.prisma 2>&1 | tail -5 || \
    echo "Prisma generate skipped"

# ── Build API ─────────────────────────────────────────────────────────────────
RUN cd /app/final_build/saas_build/apps/api && \
    /app/final_build/saas_build/node_modules/.bin/tsc \
    -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -8

RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "API build OK" || (echo "API dist/main.js MISSING" && exit 1)

# ── Build Next.js web ─────────────────────────────────────────────────────────
RUN cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    /app/final_build/saas_build/node_modules/.bin/next build 2>&1 | tail -15 || true

ENV NODE_ENV=production
ENV NODE_PATH=/app/final_build/saas_build/node_modules

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
