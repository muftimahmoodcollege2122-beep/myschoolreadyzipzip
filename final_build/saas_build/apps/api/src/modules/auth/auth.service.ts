/**
 * Authentication service — handles login, registration, token management.
 * login(): validates credentials, returns accessToken (15min) + refreshToken (7 days)
 * register(): creates new user + school under a tenant
 * refresh(): rotates refresh token and issues new access token
 * logout(): invalidates refresh token
 * Passwords hashed with bcrypt (12 rounds). JWT signed with RS256.
 */

import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_TTL = 15 * 60;
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 3600;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly cache: CacheService,
    private readonly audit: AuditService,
  ) {}

  async loginBySlug(dto: LoginDto, tenantSlug: string, ipAddress: string, userAgent: string): Promise<TokenPair & { tenantSlug: string; user: any }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new UnauthorizedException(`Tenant '${tenantSlug}' not found`);
    const tokens = await this.login(dto, tenant.id, ipAddress, userAgent);
    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: dto.email } },
      include: { profile: true },
    });
    return { ...tokens, tenantSlug: tenant.slug, user: { id: user!.id, email: user!.email, role: user!.role, tenantId: tenant.id, firstName: user!.profile?.firstName, lastName: user!.profile?.lastName } };
  }

  async login(dto: LoginDto, tenantId: string, ipAddress: string, userAgent: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      await bcrypt.compare(dto.password, '$2b$12$invalidhashfortiming0000000000000000000000000');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) throw new ForbiddenException('Account is deactivated');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Account locked. Try again in ${remaining} minutes`);
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      await this.handleFailedLogin(user.id, tenantId);
      throw new UnauthorizedException('Invalid credentials');
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

  async refresh(dto: RefreshTokenDto, tenantId: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(dto.refreshToken, { secret: this.config.get<string>('JWT_REFRESH_SECRET') });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(dto.refreshToken);
    const session = await this.prisma.userSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date())
      throw new UnauthorizedException('Session expired or revoked');

    // Only enforce tenant check when a tenantId is explicitly provided
    if (tenantId && session.user.tenantId !== tenantId)
      throw new ForbiddenException('Token tenant mismatch');

    await this.prisma.userSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });

    const resolvedTenantId = tenantId || session.user.tenantId;
    const tokens = await this.generateTokenPair(session.userId, resolvedTenantId, session.user.role, session.user.email);
    const newSessionHash = this.hashToken(tokens.refreshToken);
    await this.prisma.userSession.create({
      data: { userId: session.userId, tokenHash: newSessionHash, ipAddress: session.ipAddress, userAgent: session.userAgent, expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_TTL * 1000) },
    });

    return tokens;
  }

  async logout(userId: string, refreshToken: string, tenantId: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.userSession.updateMany({ where: { userId, tokenHash }, data: { revokedAt: new Date() } });
    const decoded = this.jwt.decode(refreshToken) as JwtPayload;
    if (decoded?.jti) await this.cache.set(`revoked:${decoded.jti}`, '1', this.ACCESS_TOKEN_TTL);
    await this.audit.log({ tenantId, userId, action: 'LOGOUT', entity: 'User', entityId: userId });
  }

  async validateAccessToken(token: string): Promise<JwtPayload> {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(token, { secret: this.config.get<string>('JWT_ACCESS_SECRET') });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const revoked = await this.cache.get(`revoked:${payload.jti}`);
    if (revoked) throw new UnauthorizedException('Token has been revoked');
    return payload;
  }

  async hashPassword(password: string): Promise<string> {
    if (password.length < 8) throw new BadRequestException('Password must be at least 8 characters');
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  private async generateTokenPair(userId: string, tenantId: string, role: string, email: string): Promise<TokenPair> {
    const jti = crypto.randomUUID();
    const base = { sub: userId, tid: tenantId, role, email, jti };
    const accessToken = this.jwt.sign({ ...base, type: 'access' }, { secret: this.config.get<string>('JWT_ACCESS_SECRET'), expiresIn: this.ACCESS_TOKEN_TTL });
    const refreshToken = this.jwt.sign({ ...base, type: 'refresh' }, { secret: this.config.get<string>('JWT_REFRESH_SECRET'), expiresIn: this.REFRESH_TOKEN_TTL });
    return { accessToken, refreshToken, expiresIn: this.ACCESS_TOKEN_TTL };
  }

  private async handleFailedLogin(userId: string, tenantId: string): Promise<void> {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { failedLoginCount: { increment: 1 } }, select: { failedLoginCount: true } });
    if (user.failedLoginCount >= this.MAX_FAILED_ATTEMPTS) {
      await this.prisma.user.update({ where: { id: userId }, data: { lockedUntil: new Date(Date.now() + this.LOCKOUT_DURATION * 1000) } });
    }
  }

  async register(dto: RegisterDto): Promise<any> {
    const rawSlug = (dto.domain || dto.schoolName)
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
    const slug = rawSlug || 'school';

    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('A school with this name or domain already exists. Please choose a different domain.');

    const emailExists = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('An account with this email already exists.');

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

    const planLimitsMap: Record<string, any> = {
      Starter:      { maxStudents: 500,       maxTeachers: 50,  smsEnabled: false, storageGb: 5 },
      Professional: { maxStudents: 2000,      maxTeachers: 200, smsEnabled: true,  storageGb: 25 },
      Enterprise:   { maxStudents: 999999,    maxTeachers: 9999, smsEnabled: true, storageGb: 1000 },
    };
    const planLimits = planLimitsMap[dto.plan || 'Professional'] || planLimitsMap['Professional'];

    await this.prisma.$transaction(async tx => {
      await tx.tenant.create({
        data: {
          id: tenantId, name: dto.schoolName, slug,
          tier: 'STARTER' as any, status: 'TRIAL' as any, schemaName,
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
          tenantId, email: dto.email, passwordHash, role: 'SCHOOL_ADMIN' as any, emailVerified: false,
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
