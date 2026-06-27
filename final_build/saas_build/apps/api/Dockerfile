FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copy full source — includes fixed .npmrc with legacy-peer-deps=true
COPY . .

# Override .npmrc
RUN echo "legacy-peer-deps=true" > /app/.npmrc && \
    echo "fund=false" >> /app/.npmrc && \
    echo "audit=false" >> /app/.npmrc

# Install api deps — full output visible
RUN cd /app/apps/api && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --legacy-peer-deps --no-audit --no-fund

# Verify @nestjs/core installed
RUN test -d /app/apps/api/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core found" || \
    (echo "❌ FATAL: @nestjs/core missing" && exit 1)

# Generate Prisma
RUN cd /app/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# dist/ is pre-built and committed — verify
RUN ls -la /app/apps/api/dist/main.js

# Install web deps
RUN cd /app/apps/web && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --legacy-peer-deps --no-audit --no-fund

# Build Next.js fresh (middleware.ts was fixed)
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -10 || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
