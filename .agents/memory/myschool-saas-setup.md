---
name: MySchool SaaS Setup
description: Key facts about the MySchool App setup in this Replit environment
---

## Architecture
- **API**: NestJS at `final_build/saas_build/apps/api` — runs on port 3001 via `node -r ts-node/register/transpile-only -r tsconfig-paths/register src/main.ts`
- **Web**: Next.js 14 at `final_build/saas_build/apps/web` — runs on port 5000 via `npx next dev -p 5000`
- **Startup**: `start.sh` — Redis → API (background) → Next.js (foreground, port 5000)
- **Database**: Replit PostgreSQL via DATABASE_URL; Redis on port 6379

## Key Fixes Applied
- Run API with `--no-workspaces` npm installs (monorepo workspace conflict)
- Added `PrismaService` to providers of: attendance, fees, auth, billing, tenants, reports, grades modules, and AppModule
- Made `AuthModule` `@Global()` so `AuthService` is available for `JwtAuthGuard` in all modules
- Added `JwtAuthGuard` as `APP_GUARD` in `AppModule` (global guard)
- Added `CacheService` to `AppModule` providers (for `TenantContextMiddleware`)
- Kafka: set `retries: 1`, `idempotent: false` in EventPublisher — Kafka is not available but app starts anyway
- AWS SDK: installed `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` in the API

## Auth Flow
- `TenantContextMiddleware` bypasses `/api/v1/auth/*` routes
- Login endpoint accepts `tenantSlug` in body (defaults to `'demo'`)
- `AuthService.loginBySlug()` looks up tenant by slug, then returns tokens + `tenantSlug` + `user`
- Frontend stores `tenantSlug` in session storage, sends as `X-Tenant-ID` header
- Login/refresh routes decorated with `@Public()` to skip global `JwtAuthGuard`

## Demo Credentials
- Tenant slug: `demo`
- Email: `admin@demo.edu`
- Password: `Admin@123456`
- Tenant ID: `e980e87c-9b10-4bc0-a6ad-15c03b3f59a2`

## JWT Config
- `.env` at `final_build/saas_build/apps/api/.env`
- `JWT_ACCESS_SECRET=dev-access-secret-change-in-production-min-32-chars`
- `JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-min-32-chars`

## Health Endpoints
- Need `@Public()` decorator — global JwtAuthGuard blocks them otherwise
- Health controller at `final_build/saas_build/apps/api/src/common/health/`

## Schema Notes
- Tenant has `tier` (not `plan`), no `email`, no `lastActiveAt`
- Exam has `name`/`scheduledAt`/`passingMarks`/`subjectId`/`isPublished`
- `studentParent` not `studentGuardian`; `feeInvoice` not `payment`

**Why:** Many modules were missing `PrismaService` in their providers (code generation bug). The global `JwtAuthGuard` pattern requires modules using the guard in controllers to have `AuthService` available — solved by making `AuthModule` global rather than adding it to every module.
