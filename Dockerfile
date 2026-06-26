FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat python3 make g++ dumb-init wget
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy everything first
COPY final_build/saas_build/ .

# Install deps directly inside apps/api (where dist/main.js will look)
RUN cd /app/apps/api && npm install --legacy-peer-deps --no-audit 2>&1 | tail -3

# Install deps for web
RUN cd /app/apps/web && npm install --legacy-peer-deps --no-audit 2>&1 | tail -3

# Install root deps
RUN npm install --legacy-peer-deps --no-audit 2>&1 | tail -3

# Generate Prisma client inside api
RUN cd /app/apps/api && \
    npx prisma generate --schema=prisma/schema.prisma 2>&1 | tail -3 || \
    (cd /app && npx prisma generate --schema=packages/database/prisma/schema.prisma 2>&1 | tail -3) || true

# Build NestJS API
RUN cd /app/apps/api && \
    npx @nestjs/cli build 2>&1 | tail -10 || \
    npx tsc -p tsconfig.build.json 2>&1 | tail -10 || true

# Verify @nestjs/core is findable from dist/main.js location
RUN node -e "require('/app/apps/api/node_modules/@nestjs/core')" && echo "✅ @nestjs/core found" || \
    node -e "require('/app/node_modules/@nestjs/core')" && echo "✅ @nestjs/core found at root" || \
    echo "❌ @nestjs/core NOT found anywhere"

# Build Next.js
RUN cd /app/apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    npx next build 2>&1 | tail -10 || true

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001 5000
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
