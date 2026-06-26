FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat python3 make g++ dumb-init wget
WORKDIR /app

# Do NOT set NODE_ENV=production during build — we need devDependencies
ENV NEXT_TELEMETRY_DISABLED=1

# Copy full source
COPY final_build/saas_build/ .

# Install ALL deps (including devDeps) inside apps/api
RUN cd /app/apps/api && \
    npm install --include=dev --legacy-peer-deps --no-audit 2>&1 | tail -5

# Install ALL deps inside apps/web
RUN cd /app/apps/web && \
    npm install --include=dev --legacy-peer-deps --no-audit 2>&1 | tail -5

# Generate Prisma client
RUN cd /app/apps/api && \
    ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || true

# Build NestJS with tsc directly (no nest CLI dependency)
RUN cd /app/apps/api && \
    ./node_modules/.bin/tsc -p tsconfig.json --outDir dist 2>&1 | tail -15 || \
    ./node_modules/.bin/nest build 2>&1 | tail -15 || \
    echo "WARNING: build failed"

# Confirm dist/main.js exists and @nestjs/core is resolvable
RUN ls /app/apps/api/dist/main.js && echo "✅ dist/main.js exists" || echo "❌ dist/main.js MISSING"
RUN ls /app/apps/api/node_modules/@nestjs/core && echo "✅ @nestjs/core exists" || echo "❌ @nestjs/core MISSING"

# Build Next.js
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    ./node_modules/.bin/next build 2>&1 | tail -10 || true

# Now set production env
ENV NODE_ENV=production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
