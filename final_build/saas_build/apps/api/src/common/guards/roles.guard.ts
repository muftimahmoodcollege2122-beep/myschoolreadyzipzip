import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/tenant-id.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const { user } = context.switchToHttp().getRequest<Request>() as any;
    if (!user?.role) throw new ForbiddenException('No role assigned');
    if (user.role === 'SUPER_ADMIN') return true;
    if (!required.includes(user.role)) throw new ForbiddenException(`Role ${user.role} not authorized`);
    return true;
  }
}
