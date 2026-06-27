FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# COPY . . puts whatever Railway's context root contains directly at /app/
COPY . .

# Debug: show exact layout
RUN echo "=== /app ===" && ls /app
RUN echo "=== checking paths ===" && \
    (ls /app/apps/api && echo "PATH: /app/apps/api") 2>/dev/null || \
    (ls /app/src && echo "PATH: /app (api is root)") 2>/dev/null || \
    echo "UNKNOWN LAYOUT"

# Override .npmrc
RUN echo "legacy-peer-deps=true" > /app/.npmrc

# Install — try both possible paths
RUN if [ -d "/app/apps/api" ]; then \
      cd /app/apps/api && npm install --legacy-peer-deps --no-audit --no-fund; \
    elif [ -f "/app/src/main.ts" ]; then \
      cd /app && npm install --legacy-peer-deps --no-audit --no-fund; \
    else \
      echo "Cannot find api source" && ls /app && exit 1; \
    fi

# Verify @nestjs/core — check both locations
RUN (test -d /app/apps/api/node_modules/@nestjs/core && echo "✅ found at /app/apps/api") || \
    (test -d /app/node_modules/@nestjs/core && echo "✅ found at /app") || \
    (echo "❌ @nestjs/core missing" && exit 1)

# Generate Prisma
RUN if [ -d "/app/apps/api" ]; then \
      cd /app/apps/api && PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3; \
    else \
      cd /app && PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3; \
    fi || true

# Verify dist/main.js
RUN ls /app/apps/api/dist/main.js 2>/dev/null || ls /app/dist/main.js

# Install web deps
RUN if [ -d "/app/apps/web" ]; then \
      cd /app/apps/web && npm install --legacy-peer-deps --no-audit --no-fund; \
    else \
      echo "No web app found — skipping"; \
    fi

# Build Next.js
RUN if [ -d "/app/apps/web" ]; then \
      cd /app/apps/web && NEXT_PUBLIC_API_URL=http://localhost:3001 ./node_modules/.bin/next build 2>&1 | tail -10; \
    fi || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
