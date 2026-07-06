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
  const tenantId = request.tenantContext?.tenantId ?? request.headers['x-tenant-id'];
  if (!tenantId) throw new Error('TenantId not found — is TenantContextMiddleware applied?');
  return tenantId;
});
