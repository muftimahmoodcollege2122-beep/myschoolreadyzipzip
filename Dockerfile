FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV NEXT_TELEMETRY_DISABLED=1

# ── Layer 1: package.json files only (cached unless deps change) ──────────────
# This is the key to fast deploys — if only source code changes,
# Docker reuses the cached node_modules layer and skips npm install entirely.
COPY final_build/saas_build/apps/api/package.json /app/final_build/saas_build/apps/api/package.json
COPY final_build/saas_build/apps/web/package.json /app/final_build/saas_build/apps/web/package.json

RUN printf "legacy-peer-deps=true\nfund=false\naudit=false\nallow-scripts=true\n" \
    > /app/final_build/saas_build/apps/api/.npmrc && \
    printf "legacy-peer-deps=true\nfund=false\naudit=false\nallow-scripts=true\n" \
    > /app/final_build/saas_build/apps/web/.npmrc

# ── Layer 2: Install API deps (cached until api/package.json changes) ─────────
RUN cd /app/final_build/saas_build/apps/api && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -3

RUN test -d /app/final_build/saas_build/apps/api/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core OK" || (echo "❌ @nestjs/core missing" && exit 1)

# ── Layer 3: Install web deps (cached until web/package.json changes) ─────────
RUN cd /app/final_build/saas_build/apps/web && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -3

RUN test -d /app/final_build/saas_build/apps/web/node_modules/next && \
    echo "✅ next OK" || (echo "❌ next missing" && exit 1)

# ── Layer 4: Copy Prisma schema (cached unless schema changes) ────────────────
COPY final_build/saas_build/apps/api/prisma /app/final_build/saas_build/apps/api/prisma

RUN cd /app/final_build/saas_build/apps/api && \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# ── Layer 5: Copy ALL source code (changes every deploy but build is fast) ────
COPY final_build/saas_build/apps/api /app/final_build/saas_build/apps/api
COPY final_build/saas_build/apps/web /app/final_build/saas_build/apps/web
COPY final_build/saas_build/packages /app/final_build/saas_build/packages

# ── Layer 6: Build API ────────────────────────────────────────────────────────
RUN cd /app/final_build/saas_build/apps/api && \
    rm -rf dist && \
    ./node_modules/.bin/tsc -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | grep -E "error TS|✔|Done" | head -10 || true

RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "✅ dist/main.js OK" || (echo "❌ dist/main.js missing" && exit 1)

# ── Layer 7: Build Next.js ────────────────────────────────────────────────────
RUN cd /app/final_build/saas_build/apps/web && \
    ./node_modules/.bin/next build 2>&1 | tail -10

RUN test -f /app/final_build/saas_build/apps/web/.next/BUILD_ID && \
    echo "✅ Next.js build OK" || (echo "❌ Next.js build failed" && exit 1)

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
