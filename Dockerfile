# ── Stage 1: Install deps ──────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache openssl libc6-compat python3 make g++
WORKDIR /app

# Copy workspace manifests
COPY final_build/saas_build/package.json final_build/saas_build/package-lock.json* ./
COPY final_build/saas_build/turbo.json ./
COPY final_build/saas_build/apps/api/package.json ./apps/api/
COPY final_build/saas_build/apps/web/package.json ./apps/web/
COPY final_build/saas_build/packages/database/package.json ./packages/database/

RUN npm install --legacy-peer-deps --no-audit --prefer-offline 2>&1 | tail -5

# ── Stage 2: Build API + Web ───────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

# Copy full source
COPY final_build/saas_build/ .

# Generate Prisma client (try both schema locations)
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma 2>&1 | tail -3 || \
    npx prisma generate --schema=packages/database/prisma/schema.prisma 2>&1 | tail -3 || \
    echo "Prisma generate skipped"

# Build NestJS API to dist/ — must produce dist/main.js
RUN cd apps/api && \
    npx @nestjs/cli build 2>&1 | tail -10 || \
    npx tsc -p tsconfig.build.json 2>&1 | tail -10 || \
    echo "WARNING: API build failed — will use ts-node at runtime"

# Build Next.js (standalone output for lean deploy)
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    npx next build 2>&1 | tail -10 || \
    echo "WARNING: Next.js build failed — will use dev server"

# ── Stage 3: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache redis openssl libc6-compat dumb-init wget
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy everything from builder
COPY --from=builder /app ./
COPY --from=builder /app/node_modules ./node_modules

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001
EXPOSE 5000

ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
