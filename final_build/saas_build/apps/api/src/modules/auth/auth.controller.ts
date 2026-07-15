/**
 * Auth REST controller — public endpoints (no JWT required).
 * POST /auth/login — email + password → tokens
 * POST /auth/register — new school signup
 * POST /auth/refresh — rotate tokens
 * POST /auth/logout — invalidate session
 * POST /auth/forgot-password — send reset email
 * POST /auth/reset-password — set new password with token
 */

import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, LogoutDto, RegisterDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId, Public } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Auth') @Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('login') @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: 'Login with email + password' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip ?? '0.0.0.0';
    const ua = req.headers['user-agent'] ?? '';
    const slug = dto.tenantSlug || (req as any).tenantContext?.tenantId || 'demo';
    return this.svc.loginBySlug(dto, slug, ip, ua);
  }

  @Post('refresh') @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    const tid = (req as any).tenantContext?.tenantId ?? req.headers['x-tenant-id'] as string ?? '';
    return this.svc.refresh(dto, tid);
  }

  @Post('logout') @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke session' })
  logout(@Body() dto: LogoutDto, @CurrentUser() user: any, @TenantId() tid: string) {
    return this.svc.logout(user.sub, dto.refreshToken, tid);
  }

  @Post('register') @HttpCode(HttpStatus.CREATED)
  @Public()
  @ApiOperation({ summary: 'Self-service school registration — creates tenant + admin user' })
  register(@Body() dto: RegisterDto) {
    return this.svc.register(dto);
  }

  @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser() user: any) { return user; }

  @Post('impersonate/:tenantId') @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard) @ApiBearerAuth() @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Super-admin: issue a scoped token to log in as a school (audit-logged)' })
  impersonate(@Param('tenantId', ParseUUIDPipe) tenantId: string, @CurrentUser() user: any) {
    return this.svc.impersonate(user.sub, tenantId);
  }
}
