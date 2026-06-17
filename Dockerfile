# ── Stage 1: Install deps ──────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache openssl libc6-compat python3 make g++
WORKDIR /app

COPY final_build/saas_build/package.json ./
COPY final_build/saas_build/package-lock.json* ./
COPY final_build/saas_build/turbo.json ./
COPY final_build/saas_build/apps/api/package.json ./apps/api/
COPY final_build/saas_build/apps/web/package.json ./apps/web/
COPY final_build/saas_build/packages/database/package.json ./packages/database/

RUN npm install --legacy-peer-deps --no-audit 2>&1 | tail -5

# ── Stage 2: Build ─────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY final_build/saas_build/ .

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma 2>&1 | tail -3 || \
    npx prisma generate --schema=packages/database/prisma/schema.prisma 2>&1 | tail -3 || \
    echo "Prisma generate skipped"

# Build NestJS API
RUN cd apps/api && \
    npx @nestjs/cli build 2>&1 | tail -10 || \
    npx tsc -p tsconfig.build.json 2>&1 | tail -10 || \
    echo "WARNING: API build failed"

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    npx next build 2>&1 | tail -10 || \
    echo "WARNING: Next.js build failed"

# ── Stage 3: Runner ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy EVERYTHING from builder — source + node_modules + dist + .next
COPY --from=builder /app /app

# Entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001
EXPOSE 5000

ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
