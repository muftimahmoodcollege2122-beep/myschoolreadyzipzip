import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/login.dto';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface JwtPayload {
    sub: string;
    tid: string;
    role: string;
    email: string;
    iat: number;
    exp: number;
    jti: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly cache;
    private readonly audit;
    private readonly logger;
    private readonly BCRYPT_ROUNDS;
    private readonly ACCESS_TOKEN_TTL;
    private readonly REFRESH_TOKEN_TTL;
    private readonly MAX_FAILED_ATTEMPTS;
    private readonly LOCKOUT_DURATION;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, cache: CacheService, audit: AuditService);
    loginBySlug(dto: LoginDto, tenantSlug: string, ipAddress: string, userAgent: string): Promise<TokenPair & {
        tenantSlug: string;
        user: any;
    }>;
    login(dto: LoginDto, tenantId: string, ipAddress: string, userAgent: string): Promise<TokenPair>;
    refresh(dto: RefreshTokenDto, tenantId: string): Promise<TokenPair>;
    logout(userId: string, refreshToken: string, tenantId: string): Promise<void>;
    validateAccessToken(token: string): Promise<JwtPayload>;
    hashPassword(password: string): Promise<string>;
    private generateTokenPair;
    private handleFailedLogin;
    register(dto: RegisterDto): Promise<any>;
    private hashToken;
}
