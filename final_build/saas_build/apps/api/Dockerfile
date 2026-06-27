FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copy source — context is saas_build/ so this puts saas_build/* at /app/
COPY . .

# Debug: show what landed at /app
RUN echo "=== /app contents ===" && ls /app && echo "=== /app/apps ===" && ls /app/apps 2>/dev/null || echo "no /app/apps"

# Override .npmrc
RUN echo "legacy-peer-deps=true" > /app/.npmrc

# Install api deps
RUN cd /app/apps/api && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Verify @nestjs/core
RUN test -d /app/apps/api/node_modules/@nestjs/core && echo "✅ @nestjs/core found" || (echo "❌ FATAL" && exit 1)

# Generate Prisma
RUN cd /app/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# Verify dist/main.js
RUN ls /app/apps/api/dist/main.js

# Install web deps
RUN cd /app/apps/web && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Build Next.js
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -10 || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
