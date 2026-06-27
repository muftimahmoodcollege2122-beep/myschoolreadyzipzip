FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .

# ── STEP 1: Show environment ───────────────────────────────────────────────────
RUN echo "=== NODE VERSION ===" && node --version && npm --version
RUN echo "=== REPO STRUCTURE ===" && ls /app && echo "---" && ls /app/final_build/saas_build/
RUN echo "=== API DIR ===" && ls /app/final_build/saas_build/apps/api/
RUN echo "=== WEB DIR ===" && ls /app/final_build/saas_build/apps/web/
RUN echo "=== NPMRC ===" && cat /app/final_build/saas_build/.npmrc

# ── STEP 2: Fix .npmrc ────────────────────────────────────────────────────────
RUN printf "legacy-peer-deps=true\nfund=false\naudit=false\nallow-scripts=true\n" \
    > /app/final_build/saas_build/.npmrc && \
    printf "legacy-peer-deps=true\nfund=false\naudit=false\n" \
    > /app/final_build/saas_build/apps/api/.npmrc && \
    printf "legacy-peer-deps=true\nfund=false\naudit=false\n" \
    > /app/final_build/saas_build/apps/web/.npmrc
RUN echo "=== NPMRC FIXED ===" && cat /app/final_build/saas_build/.npmrc

# ── STEP 3: Install API deps ──────────────────────────────────────────────────
RUN echo "=== INSTALLING API DEPS ===" && \
    cd /app/final_build/saas_build/apps/api && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1
RUN echo "=== API NODE_MODULES CHECK ===" && \
    ls /app/final_build/saas_build/apps/api/node_modules | wc -l && \
    test -d /app/final_build/saas_build/apps/api/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core OK" || echo "❌ @nestjs/core MISSING"

# ── STEP 4: Prisma ────────────────────────────────────────────────────────────
RUN echo "=== GENERATING PRISMA ===" && \
    cd /app/final_build/saas_build/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 || \
    echo "⚠️ Prisma generate failed (non-fatal)"

# ── STEP 5: API dist ──────────────────────────────────────────────────────────
RUN echo "=== API DIST CHECK ===" && \
    ls /app/final_build/saas_build/apps/api/dist/ && \
    test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "✅ dist/main.js OK" || (echo "❌ dist/main.js MISSING" && exit 1)

# ── STEP 6: Install Web deps ──────────────────────────────────────────────────
RUN echo "=== INSTALLING WEB DEPS ===" && \
    cd /app/final_build/saas_build/apps/web && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1
RUN echo "=== WEB NODE_MODULES CHECK ===" && \
    ls /app/final_build/saas_build/apps/web/node_modules | wc -l && \
    test -d /app/final_build/saas_build/apps/web/node_modules/next && \
    echo "✅ next OK" || echo "❌ next MISSING" && \
    test -d /app/final_build/saas_build/apps/web/node_modules/@tanstack && \
    echo "✅ @tanstack OK" || echo "❌ @tanstack MISSING"

# ── STEP 7: Build Next.js ─────────────────────────────────────────────────────
RUN echo "=== BUILDING NEXT.JS ===" && \
    cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1
RUN echo "=== NEXT BUILD CHECK ===" && \
    test -f /app/final_build/saas_build/apps/web/.next/BUILD_ID && \
    echo "✅ .next/BUILD_ID OK" || (echo "❌ Next.js build FAILED" && exit 1)

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
