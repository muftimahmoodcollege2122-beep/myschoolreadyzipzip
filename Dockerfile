# ── Base: Node 20 on Alpine ────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache redis openssl libc6-compat
WORKDIR /app

# ── Deps: install all workspace dependencies ───────────────────────────────────
FROM base AS deps
COPY final_build/saas_build/package*.json ./
COPY final_build/saas_build/turbo.json ./
COPY final_build/saas_build/apps/api/package*.json ./apps/api/
COPY final_build/saas_build/apps/web/package*.json ./apps/web/
COPY final_build/saas_build/packages/ ./packages/
RUN npm install --legacy-peer-deps --no-audit

# ── Builder: generate prisma + build API + build Next.js ──────────────────────
FROM deps AS builder
COPY final_build/saas_build/ .

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma || \
    npx prisma generate --schema=packages/database/prisma/schema.prisma || true

# Build NestJS API
RUN cd apps/api && npx nest build 2>&1 || \
    npx tsc -p apps/api/tsconfig.build.json 2>&1 || true

# Build Next.js web app
RUN cd apps/web && npx next build 2>&1 || true

# ── Runner: lean production image ─────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy everything built
COPY --from=builder /app ./

# Copy prisma schema for db push at runtime
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
EXPOSE 5000

# Entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
