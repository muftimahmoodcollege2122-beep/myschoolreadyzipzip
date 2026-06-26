import { ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../modules/auth/auth.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly authService;
    private readonly reflector;
    private readonly logger;
    constructor(authService: AuthService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
}
