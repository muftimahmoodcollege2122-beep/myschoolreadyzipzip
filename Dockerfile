FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# COPY . . puts repo root at /app/
# So saas_build is at /app/final_build/saas_build/
COPY . .

# Fix .npmrc
RUN echo "legacy-peer-deps=true" > /app/final_build/saas_build/.npmrc && \
    echo "fund=false" >> /app/final_build/saas_build/.npmrc && \
    echo "audit=false" >> /app/final_build/saas_build/.npmrc

# Install API deps
RUN cd /app/final_build/saas_build/apps/api && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Verify
RUN test -d /app/final_build/saas_build/apps/api/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core found" || (echo "❌ FATAL: @nestjs/core missing" && exit 1)

# Generate Prisma
RUN cd /app/final_build/saas_build/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# Verify dist/main.js
RUN ls /app/final_build/saas_build/apps/api/dist/main.js

# Install web deps
RUN cd /app/final_build/saas_build/apps/web && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Build Next.js
RUN cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -10 || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
