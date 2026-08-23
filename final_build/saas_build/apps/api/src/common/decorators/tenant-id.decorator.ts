/**
 * @TenantId() parameter decorator — extracts the resolved tenant UUID from req.tenantContext.
 * Used in every controller to get the current school's tenant ID without manual req access.
 * Throws if tenantContext is not set (middleware not applied).
 */

import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const TenantId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  // Only trust req.tenantContext.tenantId — it's DB-verified by
  // TenantContextMiddleware (runs on every request; see that file).
  // Previously fell back to the raw `x-tenant-id` header directly, which is
  // fully attacker-controlled and was never validated as a real UUID before
  // flowing into things like the logo-upload file path (tenants.service.ts
  // saveLogoFile) — a path-traversal / arbitrary-write risk on any route
  // that ever bypassed the middleware. Fail closed instead.
  const tenantId = request.tenantContext?.tenantId;
  if (!tenantId) throw new Error('TenantId not found — is TenantContextMiddleware applied?');
  return tenantId;
});
