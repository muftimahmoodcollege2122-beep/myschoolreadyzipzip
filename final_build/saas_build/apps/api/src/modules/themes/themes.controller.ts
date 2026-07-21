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

  // ── Feature 1: Nav Config ──────────────────────────────────────────────────
  @Get('nav-config/slug/:slug') @Public()
  getNavConfigBySlug(@Param('slug') slug: string) { return this.svc.getNavConfigBySlug(slug); }

  @Get('nav-config') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  getNavConfig(@TenantId() tid: string) { return this.svc.getNavConfig(tid); }

  @Put('nav-config') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  updateNavConfig(@TenantId() tid: string, @Body() dto: any) { return this.svc.updateNavConfig(tid, dto); }

  // ── Feature 2: Portal Branding ─────────────────────────────────────────────
  @Get('portal-branding/slug/:slug') @Public()
  getPortalBrandingBySlug(@Param('slug') slug: string) { return this.svc.getPortalBrandingBySlug(slug); }

  @Get('portal-branding') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  getPortalBranding(@TenantId() tid: string) { return this.svc.getPortalBranding(tid); }

  @Put('portal-branding') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  updatePortalBranding(@TenantId() tid: string, @Body() dto: any) { return this.svc.updatePortalBranding(tid, dto); }

  // ── Feature 3: Alert Banners ───────────────────────────────────────────────
  @Get('alert-banners/slug/:slug') @Public()
  getAlertBannersBySlug(@Param('slug') slug: string) { return this.svc.getAlertBannersBySlug(slug); }

  @Get('alert-banners') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  getAllAlertBanners(@TenantId() tid: string) { return this.svc.getAllAlertBanners(tid); }

  @Put('alert-banners') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  saveAlertBanners(@TenantId() tid: string, @Body() dto: { banners: any[] }) { return this.svc.saveAlertBanners(tid, dto.banners); }

  // ── Feature 4: Pages ───────────────────────────────────────────────────────
  @Get('pages/slug/:slug') @Public()
  getPagesBySlug(@Param('slug') slug: string) { return this.svc.getPagesBySlug(slug); }

  @Get('pages') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  getPages(@TenantId() tid: string) { return this.svc.getPages(tid); }

  @Put('pages') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  savePage(@TenantId() tid: string, @Body() dto: any) { return this.svc.savePage(tid, dto); }

  // ── Feature 5: Dashboard Widgets ──────────────────────────────────────────
  @Get('dashboard-widgets/slug/:slug') @Public()
  getDashboardWidgetsBySlug(@Param('slug') slug: string) { return this.svc.getDashboardWidgetsBySlug(slug); }

  @Get('dashboard-widgets') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getDashboardWidgets(@TenantId() tid: string) { return this.svc.getDashboardWidgets(tid); }

  @Put('dashboard-widgets') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  updateDashboardWidgets(@TenantId() tid: string, @Body() dto: any) { return this.svc.updateDashboardWidgets(tid, dto); }

  // ── Feature 6: Label Overrides ─────────────────────────────────────────────
  @Get('labels/slug/:slug') @Public()
  getLabelOverridesBySlug(@Param('slug') slug: string) { return this.svc.getLabelOverridesBySlug(slug); }

  @Get('labels') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getLabelOverrides(@TenantId() tid: string) { return this.svc.getLabelOverrides(tid); }

  @Put('labels') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SCHOOL_ADMIN')
  updateLabelOverrides(@TenantId() tid: string, @Body() dto: any) { return this.svc.updateLabelOverrides(tid, dto); }
}
