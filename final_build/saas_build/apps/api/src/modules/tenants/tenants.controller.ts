import { Controller, Get, Post, Put, Body, Param, UseGuards, UseInterceptors, UploadedFile, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Tenants') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('tenants')
export class TenantsController {
  constructor(private readonly svc: TenantsService) {}
  @Post() @Roles('SUPER_ADMIN') create(@Body() dto: CreateTenantDto) { return this.svc.provision(dto); }
  @Get() @Roles('SUPER_ADMIN') listAll() { return this.svc.listAll(); }
  @Get('summary') @Roles('SUPER_ADMIN') summary() { return this.svc.getPlatformSummary(); }
  @Get('current') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT') current(@TenantId() tid: string) { return this.svc.findById(tid); }
  @Put('current/branding') @Roles('SCHOOL_ADMIN') updateBranding(@TenantId() tid: string, @Body() dto: any) { return this.svc.updateConfig(tid, dto); }

  @Post('current/branding/logo') @Roles('SCHOOL_ADMIN')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  uploadLogo(@TenantId() tid: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');
    return this.svc.saveLogoFile(tid, file);
  }
  @Post(':id/suspend') @Roles('SUPER_ADMIN') suspend(@Param('id', ParseUUIDPipe) id: string) { return this.svc.suspend(id); }
  @Post(':id/reactivate') @Roles('SUPER_ADMIN') reactivate(@Param('id', ParseUUIDPipe) id: string) { return this.svc.reactivate(id); }
}
