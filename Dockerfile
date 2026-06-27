FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copy entire repo
COPY . .

# ── Install all deps at WORKSPACE ROOT (npm workspaces hoists everything here) ──
RUN cd /app/final_build/saas_build && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Verify @nestjs/core is at workspace root (expected location)
RUN test -d /app/final_build/saas_build/node_modules/@nestjs/core && \
    echo "✅ @nestjs/core found at workspace root" || \
    (echo "❌ @nestjs/core MISSING" && exit 1)

# Generate Prisma client
RUN cd /app/final_build/saas_build && \
    ./node_modules/.bin/prisma generate \
    --schema=apps/api/prisma/schema.prisma 2>&1 | tail -3 || true

# Build API using workspace root tsc/nest
RUN cd /app/final_build/saas_build/apps/api && \
    NODE_PATH=/app/final_build/saas_build/node_modules \
    /app/final_build/saas_build/node_modules/.bin/tsc \
    -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -5 || true

# Verify dist/main.js was built
RUN test -f /app/final_build/saas_build/apps/api/dist/main.js && \
    echo "✅ dist/main.js built ($(wc -c < /app/final_build/saas_build/apps/api/dist/main.js) bytes)" || \
    (echo "❌ dist/main.js MISSING" && exit 1)

# Build Next.js web app
RUN cd /app/final_build/saas_build/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    NODE_PATH=/app/final_build/saas_build/node_modules \
    /app/final_build/saas_build/node_modules/.bin/next build 2>&1 | tail -10

# Verify Next.js build
RUN test -f /app/final_build/saas_build/apps/web/.next/BUILD_ID && \
    echo "✅ Next.js built" || (echo "❌ Next.js build FAILED" && exit 1)

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
