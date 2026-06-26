FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget

WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copy full source (dist/ is pre-built and committed)
COPY . .

# Install production deps only inside apps/api
RUN cd /app/apps/api && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --omit=dev --legacy-peer-deps --no-audit 2>&1 | tail -3

# Generate Prisma client
RUN cd /app/apps/api && \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -2 || true

# Verify dist/main.js exists (pre-built)
RUN ls -la /app/apps/api/dist/main.js

# Install web deps
RUN cd /app/apps/web && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --omit=dev --legacy-peer-deps --no-audit 2>&1 | tail -3

# Build Next.js
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -5 || true

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
