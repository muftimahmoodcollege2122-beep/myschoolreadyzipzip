FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat python3 make g++ dumb-init wget

# CACHE BUST: 2026-06-26-v9
RUN echo "2026-06-26-v9"

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_SKIP_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV npm_config_ignore_scripts=false

COPY final_build/saas_build/ .

# Install api deps
RUN cd /app/apps/api && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --include=dev --legacy-peer-deps --no-audit 2>&1 | tail -3

# Generate Prisma
RUN cd /app/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -2 || true

# Compile TypeScript
RUN cd /app/apps/api && \
    ./node_modules/.bin/tsc -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | head -3 || true

# Verify
RUN ls -la /app/apps/api/dist/main.js

# Install web deps
RUN cd /app/apps/web && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --include=dev --legacy-peer-deps --no-audit 2>&1 | tail -3

# Build Next.js
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -5 || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
