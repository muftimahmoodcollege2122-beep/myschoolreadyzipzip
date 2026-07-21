import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Dashboard') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}
  @Get() @Roles('SCHOOL_ADMIN','TEACHER') school(@TenantId() tid: string, @Query('schoolId') sid: string) { return this.svc.getSchoolDashboard(tid, sid); }
  @Get('platform') @Roles('SUPER_ADMIN') platform() { return this.svc.getPlatformStats(); }
}
