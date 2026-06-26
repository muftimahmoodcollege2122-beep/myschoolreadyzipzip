"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const themes_service_1 = require("./themes.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const tenant_id_decorator_2 = require("../../common/decorators/tenant-id.decorator");
let ThemesController = class ThemesController {
    constructor(svc) {
        this.svc = svc;
    }
    getTheme(slug) { return this.svc.getSchoolTheme(slug); }
    presets() { return this.svc.getAvailablePresets(); }
    update(dto, tid) { return this.svc.updateTheme(tid, dto); }
    getByDomain(domain) { return this.svc.getSchoolThemeByDomain(domain); }
    getPortalSettingsBySlug(slug) { return this.svc.getPortalSettingsBySlug(slug); }
    getPortalSettings(tid) { return this.svc.getPortalSettings(tid); }
    updatePortalSettings(tid, dto) { return this.svc.updatePortalSettings(tid, dto); }
    getDomain(tid) { return this.svc.getDomainInfo(tid); }
    setDomain(tid, dto) {
        return this.svc.setCustomDomain(tid, dto.customDomain);
    }
    getNavConfigBySlug(slug) { return this.svc.getNavConfigBySlug(slug); }
    getNavConfig(tid) { return this.svc.getNavConfig(tid); }
    updateNavConfig(tid, dto) { return this.svc.updateNavConfig(tid, dto); }
    getPortalBrandingBySlug(slug) { return this.svc.getPortalBrandingBySlug(slug); }
    getPortalBranding(tid) { return this.svc.getPortalBranding(tid); }
    updatePortalBranding(tid, dto) { return this.svc.updatePortalBranding(tid, dto); }
    getAlertBannersBySlug(slug) { return this.svc.getAlertBannersBySlug(slug); }
    getAllAlertBanners(tid) { return this.svc.getAllAlertBanners(tid); }
    saveAlertBanners(tid, dto) { return this.svc.saveAlertBanners(tid, dto.banners); }
    getPagesBySlug(slug) { return this.svc.getPagesBySlug(slug); }
    getPages(tid) { return this.svc.getPages(tid); }
    savePage(tid, dto) { return this.svc.savePage(tid, dto); }
    getDashboardWidgetsBySlug(slug) { return this.svc.getDashboardWidgetsBySlug(slug); }
    getDashboardWidgets(tid) { return this.svc.getDashboardWidgets(tid); }
    updateDashboardWidgets(tid, dto) { return this.svc.updateDashboardWidgets(tid, dto); }
    getLabelOverridesBySlug(slug) { return this.svc.getLabelOverridesBySlug(slug); }
    getLabelOverrides(tid) { return this.svc.getLabelOverrides(tid); }
    updateLabelOverrides(tid, dto) { return this.svc.updateLabelOverrides(tid, dto); }
};
exports.ThemesController = ThemesController;
__decorate([
    (0, common_1.Get)('school/:slug'),
    (0, tenant_id_decorator_2.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get school theme by slug (public)' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getTheme", null);
__decorate([
    (0, common_1.Get)('presets'),
    (0, tenant_id_decorator_2.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available theme presets' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "presets", null);
__decorate([
    (0, common_1.Put)('current'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update school theme' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('by-domain/:domain'),
    (0, tenant_id_decorator_2.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve school by custom domain (public)' }),
    __param(0, (0, common_1.Param)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getByDomain", null);
__decorate([
    (0, common_1.Get)('portal-settings/slug/:slug'),
    (0, tenant_id_decorator_2.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get portal feature flags by slug (public — used by portals)' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getPortalSettingsBySlug", null);
__decorate([
    (0, common_1.Get)('portal-settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Get portal feature flags for current tenant' }),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getPortalSettings", null);
__decorate([
    (0, common_1.Put)('portal-settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update portal feature flags (admin only)' }),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "updatePortalSettings", null);
__decorate([
    (0, common_1.Get)('domain'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current custom domain info' }),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getDomain", null);
__decorate([
    (0, common_1.Put)('domain'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Set or remove custom domain' }),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "setDomain", null);
__decorate([
    (0, common_1.Get)('nav-config/slug/:slug'),
    (0, tenant_id_decorator_2.Public)(),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getNavConfigBySlug", null);
__decorate([
    (0, common_1.Get)('nav-config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getNavConfig", null);
__decorate([
    (0, common_1.Put)('nav-config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "updateNavConfig", null);
__decorate([
    (0, common_1.Get)('portal-branding/slug/:slug'),
    (0, tenant_id_decorator_2.Public)(),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getPortalBrandingBySlug", null);
__decorate([
    (0, common_1.Get)('portal-branding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getPortalBranding", null);
__decorate([
    (0, common_1.Put)('portal-branding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "updatePortalBranding", null);
__decorate([
    (0, common_1.Get)('alert-banners/slug/:slug'),
    (0, tenant_id_decorator_2.Public)(),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getAlertBannersBySlug", null);
__decorate([
    (0, common_1.Get)('alert-banners'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getAllAlertBanners", null);
__decorate([
    (0, common_1.Put)('alert-banners'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "saveAlertBanners", null);
__decorate([
    (0, common_1.Get)('pages/slug/:slug'),
    (0, tenant_id_decorator_2.Public)(),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getPagesBySlug", null);
__decorate([
    (0, common_1.Get)('pages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getPages", null);
__decorate([
    (0, common_1.Put)('pages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "savePage", null);
__decorate([
    (0, common_1.Get)('dashboard-widgets/slug/:slug'),
    (0, tenant_id_decorator_2.Public)(),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getDashboardWidgetsBySlug", null);
__decorate([
    (0, common_1.Get)('dashboard-widgets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getDashboardWidgets", null);
__decorate([
    (0, common_1.Put)('dashboard-widgets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "updateDashboardWidgets", null);
__decorate([
    (0, common_1.Get)('labels/slug/:slug'),
    (0, tenant_id_decorator_2.Public)(),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getLabelOverridesBySlug", null);
__decorate([
    (0, common_1.Get)('labels'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getLabelOverrides", null);
__decorate([
    (0, common_1.Put)('labels'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SCHOOL_ADMIN'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "updateLabelOverrides", null);
exports.ThemesController = ThemesController = __decorate([
    (0, swagger_1.ApiTags)('Themes'),
    (0, common_1.Controller)('themes'),
    __metadata("design:paramtypes", [themes_service_1.ThemesService])
], ThemesController);
//# sourceMappingURL=themes.controller.js.map