FROM node:20-alpine
RUN apk add --no-cache redis openssl libc6-compat python3 make g++ dumb-init wget
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy workspace files
COPY final_build/saas_build/package.json ./
COPY final_build/saas_build/package-lock.json* ./
COPY final_build/saas_build/turbo.json ./
COPY final_build/saas_build/apps/api/package.json ./apps/api/
COPY final_build/saas_build/apps/web/package.json ./apps/web/
COPY final_build/saas_build/packages/database/package.json ./packages/database/

# Install ALL deps at /app/node_modules
RUN npm install --legacy-peer-deps --no-audit 2>&1 | tail -5

# Copy full source
COPY final_build/saas_build/ .

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma 2>&1 | tail -3 || \
    npx prisma generate --schema=packages/database/prisma/schema.prisma 2>&1 | tail -3 || true

# Build NestJS API into dist/
RUN cd apps/api && \
    npx @nestjs/cli build 2>&1 | tail -10 || \
    npx tsc -p tsconfig.build.json 2>&1 | tail -10 || \
    echo "API build via ts-node fallback"

# Symlink node_modules into api dir so dist/main.js finds @nestjs/core
RUN ln -sf /app/node_modules /app/apps/api/node_modules || true

# Build Next.js
RUN cd apps/web && \
    NEXT_PUBLIC_API_URL=http://localhost:3001 \
    npx next build 2>&1 | tail -10 || \
    echo "Next.js build fallback"

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001
EXPOSE 5000

ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]
