FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY . .

# Install at workspace root
RUN cd /app/final_build/saas_build && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Verify
RUN test -d /app/final_build/saas_build/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core found" || (echo "❌ @nestjs/core MISSING" && exit 1)

# Generate Prisma
RUN cd /app/final_build/saas_build && \
    ./node_modules/.bin/prisma generate \
    --schema=apps/api/prisma/schema.prisma 2>&1 | tail -3 || true

# Build API
RUN cd /app/final_build/saas_build/apps/api && \
    /app/final_build/saas_build/node_modules/.bin/tsc \
    -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -5 || true

RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "✅ API built" || (echo "❌ API build FAILED" && exit 1)

# Build Next.js — full output so we can see any error
RUN cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    /app/final_build/saas_build/node_modules/.bin/next build

ENV NODE_ENV=production
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
