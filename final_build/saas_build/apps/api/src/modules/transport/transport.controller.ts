import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TransportService } from './transport.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Transport') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('transport')
export class TransportController {
  constructor(private readonly svc: TransportService) {}

  @Get('stats') @Roles('SCHOOL_ADMIN')
  stats(@TenantId() tid: string) { return this.svc.getStats(tid); }

  @Get('routes') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT')
  list(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('page') p: number, @Query('limit') l: number) {
    return this.svc.listRoutes(tid, sid, p, l);
  }

  @Post('routes') @Roles('SCHOOL_ADMIN')
  create(@TenantId() tid: string, @Query('schoolId') sid: string, @Body() dto: any) { return this.svc.createRoute(tid, sid, dto); }

  @Put('routes/:id') @Roles('SCHOOL_ADMIN')
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: any) { return this.svc.updateRoute(tid, id, dto); }

  @Delete('routes/:id') @Roles('SCHOOL_ADMIN')
  remove(@TenantId() tid: string, @Param('id') id: string) { return this.svc.deleteRoute(tid, id); }
}
