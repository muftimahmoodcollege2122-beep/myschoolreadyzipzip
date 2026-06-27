FROM node:20-alpine

RUN apk add --no-cache redis openssl libc6-compat python3 make g++ dumb-init wget

# Cache bust
RUN echo "2026-06-27-v2"

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_SKIP_DOWNLOAD=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Enable yarn via corepack (built into Node 20)
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy source
COPY final_build/saas_build/ .

# ── Install ALL workspace deps from root (single yarn install) ────────────────
RUN yarn install --frozen-lockfile --ignore-scripts --non-interactive 2>&1 | tail -5 || \
    yarn install --ignore-scripts --non-interactive 2>&1 | tail -5

# Verify key binaries exist
RUN test -f /app/apps/api/node_modules/.bin/tsc    && echo "tsc    OK" || \
    test -f /app/node_modules/.bin/tsc             && echo "tsc    OK (root)" || \
    (echo "ERROR: tsc not found" && find /app -name "tsc" -path "*/bin/*" 2>/dev/null | head -3)

RUN test -f /app/apps/api/node_modules/.bin/nest   && echo "nest   OK" || \
    test -f /app/node_modules/.bin/nest            && echo "nest   OK (root)" || \
    echo "WARN: nest not found"

# ── Prisma postinstall scripts ────────────────────────────────────────────────
RUN cd /app/apps/api && \
    node node_modules/prisma/scripts/preinstall-entry.js     2>/dev/null || true && \
    node node_modules/@prisma/engines/scripts/postinstall.js 2>/dev/null || true && \
    node node_modules/@prisma/client/scripts/postinstall.js  2>/dev/null || true

# ── Prisma generate ───────────────────────────────────────────────────────────
RUN cd /app/apps/api && \
    node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -5 || \
    echo "Prisma generate skipped"

# ── Compile API ───────────────────────────────────────────────────────────────
RUN cd /app/apps/api && \
    (test -f node_modules/.bin/nest && node_modules/.bin/nest build 2>&1 | tail -10) || \
    (test -f node_modules/.bin/tsc  && node_modules/.bin/tsc -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -10) || \
    (echo "Trying root node_modules..." && \
     /app/node_modules/.bin/tsc -p tsconfig.json --skipLibCheck --noEmitOnError false 2>&1 | tail -10)

# ── Verify dist ───────────────────────────────────────────────────────────────
RUN ls -lh /app/apps/api/dist/main.js && echo "Build OK"

# ── Build web app ─────────────────────────────────────────────────────────────
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    node_modules/.bin/next build 2>&1 | tail -10 || \
    /app/node_modules/.bin/next build 2>&1 | tail -10 || \
    true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
