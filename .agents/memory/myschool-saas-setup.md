---
name: MySchool SaaS Setup
description: Full setup notes, bug history, and architecture for the MySchool NestJS+Next.js app running in Replit
---

## Stack
- NestJS API: port 3001, started via `ts-node/register/transpile-only` + `tsconfig-paths/register`
- Next.js frontend: port 5000
- PostgreSQL (Replit DATABASE_URL), Redis (localhost:6379)
- Kafka is wired but ECONNREFUSED — non-fatal, app runs without it

## Start script
`start.sh` → Redis daemon → API (background, logs: /tmp/api.log) → Next.js on port 5000

## Auth flow (fully fixed)
- Login: POST /api/v1/auth/login with `{email, password, tenantSlug:"demo"}`
- Frontend stores tokens in `localStorage` key `auth-storage` (Zustand persist format)
- api-client.ts reads `localStorage` (was sessionStorage — caused redirect loop)
- AuthGuard: `src/components/layout/auth-guard.tsx` — waits for Zustand hydration, then checks isAuthenticated
- JwtAuthGuard: logs actual error on validation failure (not swallowed)

## Demo credentials
- Admin:   admin@demo.edu / Admin@123456   (tenantSlug: demo)
- Teacher: sarah.j@demo.edu / Teacher@123456
- Student: emma.smith@student.demo.edu / Student@123456

## Tenant
- ID: e980e87c-9b10-4bc0-a6ad-15c03b3f59a2, slug: demo
- School: Demo Academy (auto-resolved from tenantId when schoolId='default')

## School ID resolution (key fix)
- Dashboard, students, teachers services all had `where: {schoolId}` with literal 'default' from frontend
- Fixed: added `resolveSchoolId(tenantId, schoolId?)` in all 3 services
  - If schoolId is valid UUID → use it; else → look up first active school for tenant

## Seeded data (seed-demo.js)
Run: `cd final_build/saas_build/apps/api && node seed-demo.js`
- 25 students, 5 teachers, 10 sections (Grade 6-10, A+B each)
- 250 attendance records (14 school days)
- 75 fee invoices (3 months × 25 students, mix of PAID/PARTIAL/PENDING)
- 40 grade records, 4 subjects

## npm install quirks
Always use: `npm install --no-workspaces --legacy-peer-deps` in subdirectories

## Prisma client location
`final_build/saas_build/apps/api/node_modules/@prisma/client`

## TypeScript issues fixed (June 2026)
- `analytics/page.tsx`: incomplete ternary `?? totalTeachers ? value` → add `: 'N/A'`
- `hrm/page.tsx`: mixed `??` and `||` without parens → wrap in parens
- `dashboard-stats.tsx`: rewrote to remove missing lucide-react / @/components/ui/card / @/lib/utils

## Deployment readiness
- `start.sh` auto-seeds demo tenant inline; checks `NODE_ENV=production` for `next build && next start`
- `ENOWORKSPACES` npm error on startup is harmless (Replit IDE TypeScript installs types)
- Login page: split layout at `(auth)/login/page.tsx`; pre-fills from `?slug=&email=&firstLogin=true`
- Signup redirects to `/login?slug=X&email=Y&firstLogin=true` after 10-second countdown
