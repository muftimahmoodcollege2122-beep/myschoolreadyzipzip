import { ThemesService } from './themes.service';
export declare class ThemesController {
    private readonly svc;
    constructor(svc: ThemesService);
    getTheme(slug: string): Promise<import("./themes.service").SchoolTheme>;
    presets(): Record<string, Partial<import("./themes.service").SchoolTheme>>;
    update(dto: any, tid: string): Promise<void>;
    getByDomain(domain: string): Promise<{
        slug: string;
        theme: import("./themes.service").SchoolTheme;
    }>;
    getPortalSettingsBySlug(slug: string): Promise<import("./themes.service").PortalSettings>;
    getPortalSettings(tid: string): Promise<import("./themes.service").PortalSettings>;
    updatePortalSettings(tid: string, dto: any): Promise<import("./themes.service").PortalSettings>;
    getDomain(tid: string): Promise<{
        customDomain: string | null;
        slug: string;
    }>;
    setDomain(tid: string, dto: {
        customDomain: string | null;
    }): Promise<{
        customDomain: string | null;
        slug: string;
    }>;
    getNavConfigBySlug(slug: string): Promise<import("./themes.service").PortalNavConfig>;
    getNavConfig(tid: string): Promise<import("./themes.service").PortalNavConfig>;
    updateNavConfig(tid: string, dto: any): Promise<import("./themes.service").PortalNavConfig>;
    getPortalBrandingBySlug(slug: string): Promise<import("./themes.service").PortalBranding>;
    getPortalBranding(tid: string): Promise<import("./themes.service").PortalBranding>;
    updatePortalBranding(tid: string, dto: any): Promise<import("./themes.service").PortalBranding>;
    getAlertBannersBySlug(slug: string): Promise<import("./themes.service").AlertBanner[]>;
    getAllAlertBanners(tid: string): Promise<import("./themes.service").AlertBanner[]>;
    saveAlertBanners(tid: string, dto: {
        banners: any[];
    }): Promise<import("./themes.service").AlertBanner[]>;
    getPagesBySlug(slug: string): Promise<import("./themes.service").WebPage[]>;
    getPages(tid: string): Promise<import("./themes.service").WebPage[]>;
    savePage(tid: string, dto: any): Promise<import("./themes.service").WebPage[]>;
    getDashboardWidgetsBySlug(slug: string): Promise<import("./themes.service").DashboardWidgets>;
    getDashboardWidgets(tid: string): Promise<import("./themes.service").DashboardWidgets>;
    updateDashboardWidgets(tid: string, dto: any): Promise<import("./themes.service").DashboardWidgets>;
    getLabelOverridesBySlug(slug: string): Promise<import("./themes.service").LabelOverrides>;
    getLabelOverrides(tid: string): Promise<import("./themes.service").LabelOverrides>;
    updateLabelOverrides(tid: string, dto: any): Promise<import("./themes.service").LabelOverrides>;
}
