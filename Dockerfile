FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat python3 make g++ dumb-init wget

# CACHE BUST: 2026-06-26-v11
RUN echo "2026-06-26-v11"

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_SKIP_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

COPY final_build/saas_build/ .

# ── API: install all deps (postinstall scripts allowed) ──────────────────────
RUN cd /app/apps/api && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --include=dev --legacy-peer-deps --no-audit 2>&1 | tail -5

# ── Run blocked postinstall scripts manually if binaries still missing ────────
RUN cd /app/apps/api && \
    if [ ! -f node_modules/.bin/prisma ]; then \
      echo "Running Prisma postinstall manually..."; \
      node node_modules/prisma/scripts/preinstall-entry.js 2>/dev/null || true; \
      node node_modules/@prisma/engines/scripts/postinstall.js 2>/dev/null || true; \
      node node_modules/@prisma/client/scripts/postinstall.js 2>/dev/null || true; \
      node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true; \
    else \
      echo "Prisma binary found, generating client..."; \
      node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3; \
    fi

# ── Compile TypeScript ────────────────────────────────────────────────────────
RUN cd /app/apps/api && \
    if [ -f node_modules/.bin/nest ]; then \
      echo "Building with NestJS CLI..."; \
      node_modules/.bin/nest build 2>&1 | tail -10; \
    elif [ -f node_modules/.bin/tsc ]; then \
      echo "Building with tsc..."; \
      node_modules/.bin/tsc -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -10; \
    else \
      echo "ERROR: Neither nest nor tsc found in node_modules/.bin"; \
      ls node_modules/.bin/ | grep -E "nest|tsc|prisma" || true; \
      exit 1; \
    fi

# ── Verify build ─────────────────────────────────────────────────────────────
RUN ls -la /app/apps/api/dist/main.js && echo "✔ Build OK" || (echo "✗ dist/main.js missing"; exit 1)

# ── Web app ───────────────────────────────────────────────────────────────────
RUN cd /app/apps/web && \
    PUPPETEER_SKIP_DOWNLOAD=true \
    npm install --include=dev --legacy-peer-deps --no-audit 2>&1 | tail -5

RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    node_modules/.bin/next build 2>&1 | tail -10 || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
