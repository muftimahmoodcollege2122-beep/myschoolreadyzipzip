FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat python3 make g++ dumb-init wget
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_SKIP_DOWNLOAD=true

# Copy full source
COPY final_build/saas_build/ .

# Install ALL deps (including devDeps) inside apps/api
RUN cd /app/apps/api && npm install --include=dev --legacy-peer-deps --no-audit

# Generate Prisma
RUN cd /app/apps/api && \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# Build with tsc
RUN cd /app/apps/api && \
    ./node_modules/.bin/tsc -p tsconfig.json 2>&1 | tail -20

# Hard fail if dist/main.js missing
RUN test -f /app/apps/api/dist/main.js || (echo "FATAL: dist/main.js not built" && exit 1)

# Install web deps
RUN cd /app/apps/web && npm install --include=dev --legacy-peer-deps --no-audit

# Build Next.js
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -10 || true

ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
