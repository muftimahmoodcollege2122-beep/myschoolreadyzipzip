import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, LogoutDto, RegisterDto } from './dto/login.dto';
import { Request } from 'express';
export declare class AuthController {
    private readonly svc;
    constructor(svc: AuthService);
    login(dto: LoginDto, req: Request): Promise<import("./auth.service").TokenPair & {
        tenantSlug: string;
        user: any;
    }>;
    refresh(dto: RefreshTokenDto, req: Request): Promise<import("./auth.service").TokenPair>;
    logout(dto: LogoutDto, user: any, tid: string): Promise<void>;
    register(dto: RegisterDto): Promise<any>;
    me(user: any): any;
}
