import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Security') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('security')
export class SecurityController {
  constructor(private readonly svc: SecurityService) {}
  @Post('mfa/setup') setupMfa(@CurrentUser() u: any) { return this.svc.generateMfaSecret(u.sub); }
  @Post('mfa/enable') enableMfa(@Body() dto: any, @CurrentUser() u: any) { return this.svc.enableMfa(u.sub, dto.token); }
  @Post('mfa/disable') disableMfa(@Body() dto: any, @CurrentUser() u: any) { return this.svc.disableMfa(u.sub, dto.token); }
  @Post('mfa/verify') verifyMfa(@Body() dto: any, @CurrentUser() u: any) { return this.svc.verifyMfaToken(u.sub, dto.token); }
  @Post('ip-restrictions') @Roles('SCHOOL_ADMIN') addIpRestriction(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.addIpRestriction(dto, tid, u.sub); }
  @Get('ip-restrictions') @Roles('SCHOOL_ADMIN') listIpRestrictions(@TenantId() tid: string, @Query('type') type?: string) { return this.svc.listIpRestrictions(tid, type); }
  @Delete('ip-restrictions/:id') @Roles('SCHOOL_ADMIN') removeIpRestriction(@Param('id') id: string, @TenantId() tid: string) { return this.svc.removeIpRestriction(id, tid); }
  @Get('login-history') getLoginHistory(@TenantId() tid: string, @CurrentUser() u: any, @Query('limit') limit?: string) { return this.svc.getLoginHistory(u.sub, tid, limit ? +limit : 20); }
  @Get('login-stats') @Roles('SCHOOL_ADMIN') getTenantLoginStats(@TenantId() tid: string) { return this.svc.getTenantLoginStats(tid); }
  @Get('suspicious') @Roles('SCHOOL_ADMIN') getSuspiciousActivities(@TenantId() tid: string, @Query('resolved') resolved?: string) { return this.svc.getSuspiciousActivities(tid, resolved === 'true'); }
  @Put('suspicious/:id/resolve') @Roles('SCHOOL_ADMIN') resolveSuspicious(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.resolveSuspiciousActivity(id, tid, u.sub); }
  @Get('dashboard') @Roles('SCHOOL_ADMIN') getDashboard(@TenantId() tid: string) { return this.svc.getSecurityDashboard(tid); }
  @Get('audit-logs') @Roles('SCHOOL_ADMIN') getAuditLogs(@TenantId() tid: string, @Query('entity') entity?: string, @Query('userId') uid?: string, @Query('page') page?: string) { return this.svc.getAuditLogs(tid, entity, uid, page ? +page : 1); }
  @Get('compliance') @Roles('SCHOOL_ADMIN') getComplianceReport(@TenantId() tid: string) { return this.svc.getComplianceReport(tid); }
}
