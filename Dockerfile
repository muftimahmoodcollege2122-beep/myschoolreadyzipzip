FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copy repo — lands at /app/
# API  => /app/final_build/saas_build/apps/api/
# Web  => /app/final_build/saas_build/apps/web/
COPY . .

# .npmrc already fixed (legacy-peer-deps=true) — no override needed

# Install API deps
RUN cd /app/final_build/saas_build/apps/api && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Verify @nestjs/core
RUN test -d /app/final_build/saas_build/apps/api/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core found" || (echo "❌ @nestjs/core MISSING" && exit 1)

# Generate Prisma
RUN cd /app/final_build/saas_build/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# Rebuild dist from fixed main.ts (CORS fix)
RUN cd /app/final_build/saas_build/apps/api && \
    ./node_modules/.bin/tsc -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -5 || true

# Verify dist/main.js
RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "✅ dist/main.js found" || (echo "❌ dist/main.js MISSING" && exit 1)

# Install web deps
RUN cd /app/final_build/saas_build/apps/web && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Delete stale .next and build fresh
RUN rm -rf /app/final_build/saas_build/apps/web/.next && \
    cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -15

# Verify Next.js build
RUN test -f /app/final_build/saas_build/apps/web/.next/BUILD_ID && \
    echo "✅ Next.js built" || (echo "❌ Next.js build FAILED" && exit 1)

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
