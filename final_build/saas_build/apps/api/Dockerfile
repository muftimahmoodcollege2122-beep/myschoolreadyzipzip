FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV npm_config_legacy_peer_deps=true
ENV npm_config_fund=false
ENV npm_config_audit=false

# Copy full source
COPY . .

# Override .npmrc that has legacy-peer-deps=false
RUN echo "legacy-peer-deps=true" > /app/apps/api/.npmrc && \
    echo "fund=false" >> /app/apps/api/.npmrc && \
    echo "audit=false" >> /app/apps/api/.npmrc

# Install api deps — show full output so errors are visible
RUN cd /app/apps/api && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1

# Verify node_modules installed
RUN test -d /app/apps/api/node_modules/@nestjs/core || \
    (echo "FATAL: @nestjs/core not in node_modules" && ls /app/apps/api/node_modules | head -20 && exit 1)

# Generate Prisma
RUN cd /app/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# dist/ is pre-built and committed — just verify
RUN ls -la /app/apps/api/dist/main.js

# Install web deps
RUN echo "legacy-peer-deps=true" > /app/apps/web/.npmrc && \
    cd /app/apps/web && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -5

# Build Next.js
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -10 || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
