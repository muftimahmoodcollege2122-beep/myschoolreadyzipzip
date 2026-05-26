import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './tenant-id.decorator';
export { ROLES_KEY };
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
