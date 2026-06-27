FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .

# Fix .npmrc
RUN printf "legacy-peer-deps=true\nfund=false\naudit=false\nallow-scripts=true\n" \
    > /app/final_build/saas_build/.npmrc

# ── API ───────────────────────────────────────────────────────────────────────
RUN echo "=== INSTALLING API DEPS ===" && \
    cd /app/final_build/saas_build/apps/api && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -5

RUN test -d /app/final_build/saas_build/apps/api/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core OK" || (echo "❌ @nestjs/core MISSING" && exit 1)

RUN cd /app/final_build/saas_build/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "✅ dist/main.js OK" || (echo "❌ dist/main.js MISSING" && exit 1)

# ── WEB ───────────────────────────────────────────────────────────────────────
RUN echo "=== INSTALLING WEB DEPS ===" && \
    cd /app/final_build/saas_build/apps/web && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -5

RUN test -d /app/final_build/saas_build/apps/web/node_modules/next && \
    echo "✅ next OK" || (echo "❌ next MISSING" && exit 1)

RUN echo "=== BUILDING NEXT.JS ===" && \
    cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build

RUN test -f /app/final_build/saas_build/apps/web/.next/BUILD_ID && \
    echo "✅ Next.js built OK" || (echo "❌ Next.js build FAILED" && exit 1)

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
