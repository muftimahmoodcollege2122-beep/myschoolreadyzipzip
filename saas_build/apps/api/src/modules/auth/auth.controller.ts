import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, LogoutDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Auth') @Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('login') @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email + password' })
  login(@Body() dto: LoginDto, @TenantId() tid: string, @Req() req: Request) {
    return this.svc.login(dto, tid, req.ip ?? '0.0.0.0', req.headers['user-agent'] ?? '');
  }

  @Post('refresh') @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto, @TenantId() tid: string) {
    return this.svc.refresh(dto, tid);
  }

  @Post('logout') @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke session' })
  logout(@Body() dto: LogoutDto, @CurrentUser() user: any, @TenantId() tid: string) {
    return this.svc.logout(user.sub, dto.refreshToken, tid);
  }

  @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser() user: any) { return user; }
}
