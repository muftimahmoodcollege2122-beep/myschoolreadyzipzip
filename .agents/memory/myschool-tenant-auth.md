---
name: MySchool Tenant Auth Header
description: The x-tenant-id header must be the slug, not the UUID. Middleware resolves by slug.
---

# Tenant Authentication

**Rule:** The `x-tenant-id` request header must be the tenant **slug** (e.g. `"demo"`), NOT the tenant UUID.

**Why:** `TenantContextMiddleware.resolveTenant()` calls `prisma.tenant.findUnique({ where: { slug } })`. If you pass a UUID as the slug, it returns null → 401 "Tenant not found".

**How to apply:** The frontend `api-client.ts` correctly reads `tenantSlug` from `auth-storage` localStorage and sends it as `X-Tenant-ID`. Shell testing must also use the slug. The demo tenant slug is `demo`.

**Note:** Replit sandbox redacts JWT tokens in all shell output (even files), so shell API tests will always show 401. The real browser client works correctly since it stores/sends real tokens.
