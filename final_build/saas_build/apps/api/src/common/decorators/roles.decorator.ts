/**
 * @Roles(...roles) method decorator — marks a route as requiring specific roles.
 * Used with RolesGuard. Example: @Roles('SCHOOL_ADMIN', 'TEACHER').
 * @Public() marks a route as publicly accessible (skips JwtAuthGuard).
 */

import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './tenant-id.decorator';
export { ROLES_KEY };
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
