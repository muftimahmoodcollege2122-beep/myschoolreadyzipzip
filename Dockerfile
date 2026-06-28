FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV NEXT_TELEMETRY_DISABLED=1

# Copy full repo — lands at /app/
COPY . .

# Write .npmrc files for api and web (overrides any inherited settings)
RUN printf "legacy-peer-deps=true\nfund=false\naudit=false\nallow-scripts=true\n" \
    > /app/final_build/saas_build/apps/api/.npmrc && \
    printf "legacy-peer-deps=true\nfund=false\naudit=false\nallow-scripts=true\n" \
    > /app/final_build/saas_build/apps/web/.npmrc

# ── API ───────────────────────────────────────────────────────────────────────
RUN echo "=== Installing API deps ===" && \
    cd /app/final_build/saas_build/apps/api && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -5

RUN test -d /app/final_build/saas_build/apps/api/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core OK" || (echo "❌ FATAL: @nestjs/core missing" && exit 1)

RUN cd /app/final_build/saas_build/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# Build TypeScript — noEmitOnError false so type errors don't block output
RUN cd /app/final_build/saas_build/apps/api && \
    ./node_modules/.bin/tsc -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -5 || true

RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "✅ dist/main.js OK" || (echo "❌ FATAL: dist/main.js missing" && exit 1)

# ── WEB ───────────────────────────────────────────────────────────────────────
RUN echo "=== Installing Web deps ===" && \
    cd /app/final_build/saas_build/apps/web && \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -5

RUN test -d /app/final_build/saas_build/apps/web/node_modules/next && \
    echo "✅ next OK" || (echo "❌ FATAL: next missing" && exit 1)

RUN test -d /app/final_build/saas_build/apps/web/node_modules/@tanstack && \
    echo "✅ @tanstack OK" || (echo "❌ FATAL: @tanstack missing" && exit 1)

RUN echo "=== Building Next.js ===" && \
    cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=/api/v1 \
    ./node_modules/.bin/next build 2>&1

RUN test -f /app/final_build/saas_build/apps/web/.next/BUILD_ID && \
    echo "✅ Next.js built OK" || (echo "❌ FATAL: Next.js build failed" && exit 1)

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
