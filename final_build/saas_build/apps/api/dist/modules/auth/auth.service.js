"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const cache_service_1 = require("../../common/cache/cache.service");
const audit_service_1 = require("../../common/audit/audit.service");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwt, config, cache, audit) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.cache = cache;
        this.audit = audit;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.BCRYPT_ROUNDS = 12;
        this.ACCESS_TOKEN_TTL = 15 * 60;
        this.REFRESH_TOKEN_TTL = 7 * 24 * 3600;
        this.MAX_FAILED_ATTEMPTS = 5;
        this.LOCKOUT_DURATION = 15 * 60;
    }
    async loginBySlug(dto, tenantSlug, ipAddress, userAgent) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
        if (!tenant)
            throw new common_1.UnauthorizedException(`Tenant '${tenantSlug}' not found`);
        const tokens = await this.login(dto, tenant.id, ipAddress, userAgent);
        const user = await this.prisma.user.findUnique({
            where: { tenantId_email: { tenantId: tenant.id, email: dto.email } },
            include: { profile: true },
        });
        return { ...tokens, tenantSlug: tenant.slug, user: { id: user.id, email: user.email, role: user.role, tenantId: tenant.id, firstName: user.profile?.firstName, lastName: user.profile?.lastName } };
    }
    async login(dto, tenantId, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { tenantId_email: { tenantId, email: dto.email } },
            include: { profile: true },
        });
        if (!user || !user.passwordHash) {
            await bcrypt.compare(dto.password, '$2b$12$invalidhashfortiming0000000000000000000000000');
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive)
            throw new common_1.ForbiddenException('Account is deactivated');
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new common_1.ForbiddenException(`Account locked. Try again in ${remaining} minutes`);
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            await this.handleFailedLogin(user.id, tenantId);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokenPair(user.id, tenantId, user.role, user.email);
        const sessionHash = this.hashToken(tokens.refreshToken);
        await this.prisma.userSession.create({
            data: {
                userId: user.id,
                tokenHash: sessionHash,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_TTL * 1000),
            },
        });
        await this.audit.log({ tenantId, userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id, ipAddress, userAgent });
        return tokens;
    }
    async refresh(dto, tenantId) {
        let payload;
        try {
            payload = this.jwt.verify(dto.refreshToken, { secret: this.config.get('JWT_REFRESH_SECRET') });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokenHash = this.hashToken(dto.refreshToken);
        const session = await this.prisma.userSession.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!session || session.revokedAt || session.expiresAt < new Date())
            throw new common_1.UnauthorizedException('Session expired or revoked');
        if (tenantId && session.user.tenantId !== tenantId)
            throw new common_1.ForbiddenException('Token tenant mismatch');
        await this.prisma.userSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
        const resolvedTenantId = tenantId || session.user.tenantId;
        const tokens = await this.generateTokenPair(session.userId, resolvedTenantId, session.user.role, session.user.email);
        const newSessionHash = this.hashToken(tokens.refreshToken);
        await this.prisma.userSession.create({
            data: { userId: session.userId, tokenHash: newSessionHash, ipAddress: session.ipAddress, userAgent: session.userAgent, expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_TTL * 1000) },
        });
        return tokens;
    }
    async logout(userId, refreshToken, tenantId) {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.userSession.updateMany({ where: { userId, tokenHash }, data: { revokedAt: new Date() } });
        const decoded = this.jwt.decode(refreshToken);
        if (decoded?.jti)
            await this.cache.set(`revoked:${decoded.jti}`, '1', this.ACCESS_TOKEN_TTL);
        await this.audit.log({ tenantId, userId, action: 'LOGOUT', entity: 'User', entityId: userId });
    }
    async validateAccessToken(token) {
        let payload;
        try {
            payload = this.jwt.verify(token, { secret: this.config.get('JWT_ACCESS_SECRET') });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        const revoked = await this.cache.get(`revoked:${payload.jti}`);
        if (revoked)
            throw new common_1.UnauthorizedException('Token has been revoked');
        return payload;
    }
    async hashPassword(password) {
        if (password.length < 8)
            throw new common_1.BadRequestException('Password must be at least 8 characters');
        return bcrypt.hash(password, this.BCRYPT_ROUNDS);
    }
    async generateTokenPair(userId, tenantId, role, email) {
        const jti = crypto.randomUUID();
        const base = { sub: userId, tid: tenantId, role, email, jti };
        const accessToken = this.jwt.sign({ ...base, type: 'access' }, { secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn: this.ACCESS_TOKEN_TTL });
        const refreshToken = this.jwt.sign({ ...base, type: 'refresh' }, { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.REFRESH_TOKEN_TTL });
        return { accessToken, refreshToken, expiresIn: this.ACCESS_TOKEN_TTL };
    }
    async handleFailedLogin(userId, tenantId) {
        const user = await this.prisma.user.update({ where: { id: userId }, data: { failedLoginCount: { increment: 1 } }, select: { failedLoginCount: true } });
        if (user.failedLoginCount >= this.MAX_FAILED_ATTEMPTS) {
            await this.prisma.user.update({ where: { id: userId }, data: { lockedUntil: new Date(Date.now() + this.LOCKOUT_DURATION * 1000) } });
        }
    }
    async register(dto) {
        const rawSlug = (dto.domain || dto.schoolName)
            .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
        const slug = rawSlug || 'school';
        const existing = await this.prisma.tenant.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.ConflictException('A school with this name or domain already exists. Please choose a different domain.');
        const emailExists = await this.prisma.user.findFirst({ where: { email: dto.email } });
        if (emailExists)
            throw new common_1.ConflictException('An account with this email already exists.');
        const nameParts = dto.principalName.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Admin';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0];
        const suffix = Math.floor(100 + Math.random() * 900);
        const tempPassword = `Welcome@${new Date().getFullYear()}${suffix}`;
        const passwordHash = await bcrypt.hash(tempPassword, this.BCRYPT_ROUNDS);
        const tenantId = crypto.randomUUID();
        const schemaName = `tenant_${slug.replace(/-/g, '_')}`;
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;
        const planLimitsMap = {
            Starter: { maxStudents: 500, maxTeachers: 50, smsEnabled: false, storageGb: 5 },
            Professional: { maxStudents: 2000, maxTeachers: 200, smsEnabled: true, storageGb: 25 },
            Enterprise: { maxStudents: 999999, maxTeachers: 9999, smsEnabled: true, storageGb: 1000 },
        };
        const planLimits = planLimitsMap[dto.plan || 'Professional'] || planLimitsMap['Professional'];
        await this.prisma.$transaction(async (tx) => {
            await tx.tenant.create({
                data: {
                    id: tenantId, name: dto.schoolName, slug,
                    tier: 'STARTER', status: 'TRIAL', schemaName,
                    dataRegion: 'ap-south-1',
                    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    planLimits, settings: { timezone: 'Asia/Karachi', locale: 'en', currency: 'PKR', academicYear },
                },
            });
            await tx.school.create({
                data: {
                    tenantId, name: dto.schoolName, code: slug.slice(0, 10).toUpperCase(),
                    address: { country: dto.country || 'Pakistan' },
                    phone: dto.phone, email: dto.email,
                    timezone: 'Asia/Karachi', locale: 'en', academicYear,
                },
            });
            await tx.user.create({
                data: {
                    tenantId, email: dto.email, passwordHash, role: 'SCHOOL_ADMIN', emailVerified: false,
                    profile: { create: { firstName, lastName, phone: dto.phone } },
                },
            });
        });
        this.logger.log(`New school registered: ${slug} (${dto.email})`);
        return {
            success: true,
            slug,
            schoolName: dto.schoolName,
            adminEmail: dto.email,
            tempPassword,
            loginUrl: '/login',
            dashboardUrl: `/dashboard`,
            websiteUrl: `${slug}.myschool.pk`,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        cache_service_1.CacheService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map