import { Injectable, ExecutionContext, UnauthorizedException, CanActivate, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../decorators/tenant-id.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private readonly authService: AuthService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Authentication token required');

    try {
      const payload = await this.authService.validateAccessToken(token);
      (request as any).user = payload;
      const tenantId = (request as any).tenantContext?.tenantId;
      if (tenantId && payload.tid !== tenantId && payload.role !== 'SUPER_ADMIN') {
        throw new UnauthorizedException('Token tenant mismatch');
      }
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
    return (request as any).cookies?.access_token;
  }
}

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
