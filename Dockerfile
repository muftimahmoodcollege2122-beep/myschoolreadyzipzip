FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget python3 make g++

RUN echo "2026-06-27-v6"

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY . .

# Install at workspace root
RUN cd /app/final_build/saas_build && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    yarn install --frozen-lockfile --ignore-scripts --non-interactive 2>&1 | tail -5 || \
    yarn install --ignore-scripts --non-interactive 2>&1 | tail -5

RUN test -d /app/final_build/saas_build/node_modules/@nestjs/core && \
    echo "@nestjs/core OK" || (echo "@nestjs/core MISSING" && exit 1)

RUN test -d /app/final_build/saas_build/node_modules/next && \
    echo "next OK" || (echo "next MISSING" && exit 1)

# Prisma generate
RUN cd /app/final_build/saas_build && \
    ./node_modules/.bin/prisma generate \
    --schema=apps/api/prisma/schema.prisma 2>&1 | tail -5 || true

# Build API
RUN cd /app/final_build/saas_build/apps/api && \
    /app/final_build/saas_build/node_modules/.bin/tsc \
    -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -8

RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "API build OK" || (echo "API dist/main.js MISSING" && exit 1)

# Build Next.js — NO || true, must succeed
RUN cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    /app/final_build/saas_build/node_modules/.bin/next build

# Verify .next was created
RUN test -f /app/final_build/saas_build/apps/web/.next/BUILD_ID && \
    echo "Next.js build OK" || (echo "Next.js .next/BUILD_ID MISSING" && exit 1)

ENV NODE_ENV=production
ENV NODE_PATH=/app/final_build/saas_build/node_modules

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
