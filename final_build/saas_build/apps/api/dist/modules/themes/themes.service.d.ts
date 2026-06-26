import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
export interface NavItem {
    key: string;
    icon: string;
    label: string;
    href: string;
    enabled: boolean;
    order: number;
}
export interface PortalNavConfig {
    teacher: NavItem[];
    student: NavItem[];
    parent: NavItem[];
}
export interface PortalBranding {
    teacher: {
        sidebarBg: string;
        sidebarText: string;
        sidebarAccent: string;
        logo: string;
    };
    student: {
        sidebarBg: string;
        sidebarText: string;
        sidebarAccent: string;
        logo: string;
    };
    parent: {
        sidebarBg: string;
        sidebarText: string;
        sidebarAccent: string;
        logo: string;
    };
    admin: {
        sidebarBg: string;
        sidebarText: string;
        sidebarAccent: string;
        logo: string;
    };
}
export interface AlertBanner {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    portals: ('teacher' | 'student' | 'parent' | 'admin')[];
    active: boolean;
    expiresAt?: string;
    createdAt: string;
}
export interface PageBlock {
    id: string;
    type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'team' | 'faq' | 'stats';
    content: Record<string, any>;
    order: number;
}
export interface WebPage {
    slug: string;
    title: string;
    metaTitle: string;
    metaDesc: string;
    status: 'published' | 'draft';
    blocks: PageBlock[];
    updatedAt: string;
}
export interface WidgetConfig {
    key: string;
    label: string;
    enabled: boolean;
    order: number;
}
export interface DashboardWidgets {
    teacher: WidgetConfig[];
    student: WidgetConfig[];
    parent: WidgetConfig[];
}
export interface LabelOverrides {
    appName: string;
    studentLabel: string;
    teacherLabel: string;
    parentLabel: string;
    classLabel: string;
    sectionLabel: string;
    feeLabel: string;
    attendanceLabel: string;
    gradesLabel: string;
    admissionsLabel: string;
    custom: Record<string, string>;
}
export interface SchoolTheme {
    template: 'classic' | 'modern' | 'bold' | 'elegant' | 'vibrant';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    bgColor: string;
    fontHeading: string;
    fontBody: string;
    heroStyle: 'centered' | 'split' | 'full-bg' | 'minimal' | 'diagonal';
    logoUrl: string;
    logoShape: 'circle' | 'rounded' | 'square';
    borderRadius: 'none' | 'small' | 'medium' | 'large';
    shadowStyle: 'none' | 'soft' | 'medium' | 'strong';
    navStyle: 'solid' | 'transparent' | 'gradient' | 'outline';
    buttonStyle: 'solid' | 'outline' | 'pill' | 'sharp';
    schoolName: string;
    tagline: string;
    city: string;
    phone: string;
    email: string;
    address: string;
    established: string;
    principalName: string;
    coverImageUrl: string;
    socialLinks: {
        facebook?: string;
        twitter?: string;
        youtube?: string;
        instagram?: string;
    };
}
export interface PortalSettings {
    teacher: {
        attendance: boolean;
        timetable: boolean;
        gradebook: boolean;
        lms: boolean;
        announcements: boolean;
        exams: boolean;
        lessonPlans: boolean;
        resources: boolean;
        students: boolean;
        assignments: boolean;
    };
    student: {
        timetable: boolean;
        assignments: boolean;
        grades: boolean;
        attendance: boolean;
        fees: boolean;
        announcements: boolean;
        resources: boolean;
        results: boolean;
        library: boolean;
    };
    parent: {
        attendance: boolean;
        grades: boolean;
        fees: boolean;
        timetable: boolean;
        announcements: boolean;
        assignments: boolean;
        results: boolean;
        transport: boolean;
    };
    website: {
        hero: boolean;
        about: boolean;
        stats: boolean;
        gallery: boolean;
        events: boolean;
        admissions: boolean;
        staff: boolean;
        testimonials: boolean;
        contact: boolean;
        news: boolean;
        heroTitle: string;
        heroSubtitle: string;
        heroCtaText: string;
        aboutText: string;
        statsStudents: string;
        statsTeachers: string;
        statsYears: string;
        statsPassRate: string;
    };
}
export declare const THEME_PRESETS: Record<string, Partial<SchoolTheme>>;
export declare class ThemesService {
    private readonly prisma;
    private readonly cache;
    constructor(prisma: PrismaService, cache: CacheService);
    getSchoolTheme(slug: string): Promise<SchoolTheme>;
    getSchoolThemeByDomain(domain: string): Promise<{
        slug: string;
        theme: SchoolTheme;
    }>;
    updateTheme(tenantId: string, theme: Partial<SchoolTheme>): Promise<void>;
    getAvailablePresets(): Record<string, Partial<SchoolTheme>>;
    getPortalSettings(tenantId: string): Promise<PortalSettings>;
    getPortalSettingsBySlug(slug: string): Promise<PortalSettings>;
    updatePortalSettings(tenantId: string, settings: Partial<PortalSettings>): Promise<PortalSettings>;
    getNavConfig(tenantId: string): Promise<PortalNavConfig>;
    getNavConfigBySlug(slug: string): Promise<PortalNavConfig>;
    updateNavConfig(tenantId: string, config: Partial<PortalNavConfig>): Promise<PortalNavConfig>;
    getPortalBranding(tenantId: string): Promise<PortalBranding>;
    getPortalBrandingBySlug(slug: string): Promise<PortalBranding>;
    updatePortalBranding(tenantId: string, branding: Partial<PortalBranding>): Promise<PortalBranding>;
    getAlertBanners(tenantId: string): Promise<AlertBanner[]>;
    getAlertBannersBySlug(slug: string): Promise<AlertBanner[]>;
    getAllAlertBanners(tenantId: string): Promise<AlertBanner[]>;
    saveAlertBanners(tenantId: string, banners: AlertBanner[]): Promise<AlertBanner[]>;
    getPages(tenantId: string): Promise<WebPage[]>;
    getPagesBySlug(slug: string): Promise<WebPage[]>;
    savePage(tenantId: string, page: WebPage): Promise<WebPage[]>;
    getDashboardWidgets(tenantId: string): Promise<DashboardWidgets>;
    getDashboardWidgetsBySlug(slug: string): Promise<DashboardWidgets>;
    updateDashboardWidgets(tenantId: string, widgets: Partial<DashboardWidgets>): Promise<DashboardWidgets>;
    getLabelOverrides(tenantId: string): Promise<LabelOverrides>;
    getLabelOverridesBySlug(slug: string): Promise<LabelOverrides>;
    updateLabelOverrides(tenantId: string, labels: Partial<LabelOverrides>): Promise<LabelOverrides>;
    getDomainInfo(tenantId: string): Promise<{
        customDomain: string | null;
        slug: string;
    }>;
    setCustomDomain(tenantId: string, customDomain: string | null): Promise<{
        customDomain: string | null;
        slug: string;
    }>;
}
