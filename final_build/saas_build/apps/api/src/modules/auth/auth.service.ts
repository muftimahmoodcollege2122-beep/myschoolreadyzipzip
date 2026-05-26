import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';

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

    if (session.user.tenantId !== tenantId)
      throw new ForbiddenException('Token tenant mismatch');

    await this.prisma.userSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });

    const tokens = await this.generateTokenPair(session.userId, tenantId, session.user.role, session.user.email);
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
