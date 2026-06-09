import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ThemesService } from './themes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Public } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Themes') @Controller('themes')
export class ThemesController {
  constructor(private readonly svc: ThemesService) {}

  @Get('school/:slug') @Public()
  @ApiOperation({ summary: 'Get school theme by slug (public)' })
  getTheme(@Param('slug') slug: string) { return this.svc.getSchoolTheme(slug); }

  @Get('presets') @Public()
  @ApiOperation({ summary: 'Get all available theme presets' })
  presets() { return this.svc.getAvailablePresets(); }

  @Put('current') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Update school theme' })
  update(@Body() dto: any, @TenantId() tid: string) { return this.svc.updateTheme(tid, dto); }

  // ── By custom domain (public — used by web middleware) ─────────────────────
  @Get('by-domain/:domain') @Public()
  @ApiOperation({ summary: 'Resolve school by custom domain (public)' })
  getByDomain(@Param('domain') domain: string) { return this.svc.getSchoolThemeByDomain(domain); }

  // ── Portal Settings ────────────────────────────────────────────────────────
  @Get('portal-settings/slug/:slug') @Public()
  @ApiOperation({ summary: 'Get portal feature flags by slug (public — used by portals)' })
  getPortalSettingsBySlug(@Param('slug') slug: string) { return this.svc.getPortalSettingsBySlug(slug); }

  @Get('portal-settings') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get portal feature flags for current tenant' })
  getPortalSettings(@TenantId() tid: string) { return this.svc.getPortalSettings(tid); }

  @Put('portal-settings') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Update portal feature flags (admin only)' })
  updatePortalSettings(@TenantId() tid: string, @Body() dto: any) { return this.svc.updatePortalSettings(tid, dto); }

  // ── Custom Domain ──────────────────────────────────────────────────────────
  @Get('domain') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Get current custom domain info' })
  getDomain(@TenantId() tid: string) { return this.svc.getDomainInfo(tid); }

  @Put('domain') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Set or remove custom domain' })
  setDomain(@TenantId() tid: string, @Body() dto: { customDomain: string | null }) {
    return this.svc.setCustomDomain(tid, dto.customDomain);
  }
}
