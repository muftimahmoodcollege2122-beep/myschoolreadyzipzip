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

# Generate Prisma — must fail the build if this fails, otherwise the API ships
# with a stale/missing client and queries fail at runtime with cryptic
# PrismaClientValidationError 400s that look unrelated to this step.
RUN cd /app/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma

# Build NestJS API from source (dist/ is gitignored — never committed, must be built here)
RUN cd /app/apps/api && ./node_modules/.bin/nest build

# Verify the build actually produced output
RUN ls -la /app/apps/api/dist/main.js

# Install web deps
RUN cd /app/apps/web && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --legacy-peer-deps --no-audit --no-fund

# Build Next.js fresh — must also fail loudly on error, same reasoning as above.
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
