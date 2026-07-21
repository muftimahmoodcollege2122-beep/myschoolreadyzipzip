/**
 * @CurrentUser() parameter decorator — extracts the JWT payload from req.user.
 * Returns: { sub: userId, email, role, tenantId, schoolId }.
 * Set by JwtAuthGuard after token verification.
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) =>
  ctx.switchToHttp().getRequest().user);
