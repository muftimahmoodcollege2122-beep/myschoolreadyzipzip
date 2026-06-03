---
name: MySchool Module Stack
description: Runtime environment details, non-fatal errors, and module registration facts.
---

# Module Stack

**Ports:** API on 3001, Next.js frontend on 5000

**Redis:** Runs on localhost (started via start.sh before API)

**Kafka:** ECONNREFUSED 9092 errors are NON-FATAL — app runs without Kafka

**JWT in Replit shell:** The sandbox redacts JWT tokens from all stdout/stderr/files. Testing API endpoints from bash always returns 401 (token shows as `[REDACTED]`). The frontend browser client works correctly.

**Module registration:** LibraryModule, TransportModule, SchoolDataModule must all be in `app.module.ts` imports array. PrismaService can be provided per-module (each gets its own connection pool entry).

**APP_GUARD:** JwtAuthGuard and RolesGuard are registered globally via `APP_GUARD` in AppModule — no need to re-import guards in individual modules.

**Installed npm packages:** Always use `--no-workspaces --legacy-peer-deps` when running npm in subdirectories.
