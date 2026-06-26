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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemesService = exports.THEME_PRESETS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const cache_service_1 = require("../../common/cache/cache.service");
const DEFAULT_NAV_CONFIG = {
    teacher: [
        { key: 'dashboard', icon: '📊', label: 'Dashboard', href: '/dashboard', enabled: true, order: 0 },
        { key: 'attendance', icon: '📝', label: 'Attendance', href: '/dashboard/attendance', enabled: true, order: 1 },
        { key: 'assignments', icon: '📋', label: 'Assignments', href: '/dashboard/assignments', enabled: true, order: 2 },
        { key: 'grades', icon: '📊', label: 'Grades', href: '/dashboard/grades', enabled: true, order: 3 },
        { key: 'timetable', icon: '📅', label: 'Timetable', href: '/dashboard/timetable', enabled: true, order: 4 },
        { key: 'announcements', icon: '💬', label: 'Announcements', href: '/dashboard/announcements', enabled: true, order: 5 },
        { key: 'students', icon: '👩‍🎓', label: 'My Students', href: '/dashboard/students', enabled: true, order: 6 },
        { key: 'resources', icon: '🗂️', label: 'Resources', href: '/dashboard/resources', enabled: true, order: 7 },
    ],
    student: [
        { key: 'dashboard', icon: '🏠', label: 'Dashboard', href: '/dashboard', enabled: true, order: 0 },
        { key: 'timetable', icon: '📅', label: 'Timetable', href: '/dashboard/timetable', enabled: true, order: 1 },
        { key: 'assignments', icon: '📝', label: 'Assignments', href: '/dashboard/assignments', enabled: true, order: 2 },
        { key: 'grades', icon: '📊', label: 'Grades', href: '/dashboard/grades', enabled: true, order: 3 },
        { key: 'attendance', icon: '✅', label: 'Attendance', href: '/dashboard/attendance', enabled: true, order: 4 },
        { key: 'fees', icon: '💰', label: 'Fee Status', href: '/dashboard/fees', enabled: true, order: 5 },
        { key: 'announcements', icon: '💬', label: 'Announcements', href: '/dashboard/announcements', enabled: true, order: 6 },
        { key: 'resources', icon: '🗂️', label: 'Resources', href: '/dashboard/resources', enabled: true, order: 7 },
        { key: 'results', icon: '🏆', label: 'Results', href: '/dashboard/results', enabled: true, order: 8 },
    ],
    parent: [
        { key: 'dashboard', icon: '🏠', label: 'Overview', href: '/dashboard', enabled: true, order: 0 },
        { key: 'attendance', icon: '✅', label: 'Attendance', href: '/dashboard/attendance', enabled: true, order: 1 },
        { key: 'grades', icon: '📊', label: 'Grades', href: '/dashboard/grades', enabled: true, order: 2 },
        { key: 'fees', icon: '💰', label: 'Fees', href: '/dashboard/fees', enabled: true, order: 3 },
        { key: 'timetable', icon: '📅', label: 'Timetable', href: '/dashboard/timetable', enabled: true, order: 4 },
        { key: 'announcements', icon: '💬', label: 'Announcements', href: '/dashboard/announcements', enabled: true, order: 5 },
        { key: 'assignments', icon: '📋', label: 'Assignments', href: '/dashboard/assignments', enabled: true, order: 6 },
        { key: 'results', icon: '🏆', label: 'Results', href: '/dashboard/results', enabled: true, order: 7 },
        { key: 'transport', icon: '🚌', label: 'Transport', href: '/dashboard/transport', enabled: true, order: 8 },
    ],
};
const DEFAULT_PORTAL_BRANDING = {
    teacher: { sidebarBg: '#042f2e', sidebarText: '#99f6e4', sidebarAccent: '#0d9488', logo: '' },
    student: { sidebarBg: '#2e1065', sidebarText: '#ddd6fe', sidebarAccent: '#7c3aed', logo: '' },
    parent: { sidebarBg: '#4c0519', sidebarText: '#fecdd3', sidebarAccent: '#e11d48', logo: '' },
    admin: { sidebarBg: '#0f172a', sidebarText: '#94a3b8', sidebarAccent: '#2563eb', logo: '' },
};
const DEFAULT_PAGES = [
    { slug: 'home', title: 'Home', metaTitle: '', metaDesc: '', status: 'published', blocks: [], updatedAt: new Date().toISOString() },
    { slug: 'about', title: 'About Us', metaTitle: '', metaDesc: '', status: 'published', blocks: [], updatedAt: new Date().toISOString() },
    { slug: 'admissions', title: 'Admissions', metaTitle: '', metaDesc: '', status: 'draft', blocks: [], updatedAt: new Date().toISOString() },
    { slug: 'contact', title: 'Contact', metaTitle: '', metaDesc: '', status: 'published', blocks: [], updatedAt: new Date().toISOString() },
    { slug: 'faculty', title: 'Faculty', metaTitle: '', metaDesc: '', status: 'draft', blocks: [], updatedAt: new Date().toISOString() },
];
const DEFAULT_WIDGETS = {
    teacher: [
        { key: 'todayClasses', label: 'Today\'s Classes', enabled: true, order: 0 },
        { key: 'pendingGrading', label: 'Pending Grading', enabled: true, order: 1 },
        { key: 'assignments', label: 'Recent Assignments', enabled: true, order: 2 },
        { key: 'announcements', label: 'Announcements', enabled: true, order: 3 },
        { key: 'studentList', label: 'My Students', enabled: true, order: 4 },
        { key: 'attendanceSummary', label: 'Attendance Summary', enabled: true, order: 5 },
    ],
    student: [
        { key: 'todayClasses', label: 'Today\'s Classes', enabled: true, order: 0 },
        { key: 'attendance', label: 'Attendance %', enabled: true, order: 1 },
        { key: 'assignments', label: 'Pending Assignments', enabled: true, order: 2 },
        { key: 'grades', label: 'Recent Grades', enabled: true, order: 3 },
        { key: 'announcements', label: 'Announcements', enabled: true, order: 4 },
        { key: 'feeStatus', label: 'Fee Status', enabled: true, order: 5 },
        { key: 'results', label: 'Latest Results', enabled: true, order: 6 },
    ],
    parent: [
        { key: 'childAttendance', label: 'Child Attendance', enabled: true, order: 0 },
        { key: 'childGrades', label: 'Child Grades', enabled: true, order: 1 },
        { key: 'feeStatus', label: 'Fee Status', enabled: true, order: 2 },
        { key: 'announcements', label: 'Announcements', enabled: true, order: 3 },
        { key: 'assignments', label: 'Child Assignments', enabled: true, order: 4 },
        { key: 'timetable', label: 'Child Timetable', enabled: true, order: 5 },
    ],
};
const DEFAULT_PORTAL_SETTINGS = {
    teacher: {
        attendance: true, timetable: true, gradebook: true, lms: true,
        announcements: true, exams: true, lessonPlans: true, resources: true,
        students: true, assignments: true,
    },
    student: {
        timetable: true, assignments: true, grades: true, attendance: true,
        fees: true, announcements: true, resources: true, results: true, library: true,
    },
    parent: {
        attendance: true, grades: true, fees: true, timetable: true,
        announcements: true, assignments: true, results: true, transport: true,
    },
    website: {
        hero: true, about: true, stats: true, gallery: true, events: true,
        admissions: true, staff: true, testimonials: true, contact: true, news: true,
        heroTitle: 'Shaping Future Leaders',
        heroSubtitle: 'Excellence in Education — Nurturing young minds with world-class education.',
        heroCtaText: 'Apply Now',
        aboutText: 'We are committed to providing an exceptional learning environment where every student can thrive.',
        statsStudents: '2500+', statsTeachers: '120+', statsYears: '30+', statsPassRate: '98%',
    },
};
exports.THEME_PRESETS = {
    emerald: { primaryColor: '#059669', secondaryColor: '#065F46', accentColor: '#F59E0B', bgColor: '#F0FDF4', template: 'classic', heroStyle: 'centered', fontHeading: 'Plus Jakarta Sans', fontBody: 'Inter', borderRadius: 'medium', shadowStyle: 'soft', navStyle: 'solid', buttonStyle: 'solid' },
    cobalt: { primaryColor: '#2563EB', secondaryColor: '#1E40AF', accentColor: '#F97316', bgColor: '#EFF6FF', template: 'modern', heroStyle: 'split', fontHeading: 'Syne', fontBody: 'DM Sans', borderRadius: 'large', shadowStyle: 'medium', navStyle: 'gradient', buttonStyle: 'pill' },
    crimson: { primaryColor: '#DC2626', secondaryColor: '#991B1B', accentColor: '#FBBF24', bgColor: '#FFF5F5', template: 'bold', heroStyle: 'full-bg', fontHeading: 'Montserrat', fontBody: 'Open Sans', borderRadius: 'none', shadowStyle: 'strong', navStyle: 'solid', buttonStyle: 'sharp' },
    violet: { primaryColor: '#7C3AED', secondaryColor: '#5B21B6', accentColor: '#EC4899', bgColor: '#F5F3FF', template: 'elegant', heroStyle: 'diagonal', fontHeading: 'Cormorant Garamond', fontBody: 'Lato', borderRadius: 'large', shadowStyle: 'soft', navStyle: 'transparent', buttonStyle: 'outline' },
    amber: { primaryColor: '#D97706', secondaryColor: '#92400E', accentColor: '#10B981', bgColor: '#FFFBEB', template: 'vibrant', heroStyle: 'centered', fontHeading: 'Raleway', fontBody: 'Source Sans Pro', borderRadius: 'medium', shadowStyle: 'medium', navStyle: 'gradient', buttonStyle: 'pill' },
    teal: { primaryColor: '#0D9488', secondaryColor: '#115E59', accentColor: '#8B5CF6', bgColor: '#F0FDFA', template: 'modern', heroStyle: 'split', fontHeading: 'Nunito', fontBody: 'Roboto', borderRadius: 'large', shadowStyle: 'soft', navStyle: 'solid', buttonStyle: 'solid' },
    navy: { primaryColor: '#1E3A5F', secondaryColor: '#0F2137', accentColor: '#F59E0B', bgColor: '#F8FAFF', template: 'elegant', heroStyle: 'centered', fontHeading: 'Playfair Display', fontBody: 'Lato', borderRadius: 'small', shadowStyle: 'medium', navStyle: 'solid', buttonStyle: 'outline' },
    rose: { primaryColor: '#E11D48', secondaryColor: '#9F1239', accentColor: '#06B6D4', bgColor: '#FFF1F2', template: 'vibrant', heroStyle: 'diagonal', fontHeading: 'Syne', fontBody: 'DM Sans', borderRadius: 'large', shadowStyle: 'soft', navStyle: 'gradient', buttonStyle: 'pill' },
    forest: { primaryColor: '#15803D', secondaryColor: '#14532D', accentColor: '#CA8A04', bgColor: '#F0FDF4', template: 'classic', heroStyle: 'full-bg', fontHeading: 'Oswald', fontBody: 'Open Sans', borderRadius: 'none', shadowStyle: 'strong', navStyle: 'solid', buttonStyle: 'sharp' },
    slate: { primaryColor: '#475569', secondaryColor: '#1E293B', accentColor: '#38BDF8', bgColor: '#F8FAFC', template: 'modern', heroStyle: 'split', fontHeading: 'Plus Jakarta Sans', fontBody: 'Inter', borderRadius: 'medium', shadowStyle: 'soft', navStyle: 'transparent', buttonStyle: 'solid' },
    orange: { primaryColor: '#EA580C', secondaryColor: '#9A3412', accentColor: '#0EA5E9', bgColor: '#FFF7ED', template: 'bold', heroStyle: 'centered', fontHeading: 'Bebas Neue', fontBody: 'Roboto', borderRadius: 'small', shadowStyle: 'strong', navStyle: 'solid', buttonStyle: 'solid' },
    indigo: { primaryColor: '#4338CA', secondaryColor: '#312E81', accentColor: '#F59E0B', bgColor: '#EEF2FF', template: 'elegant', heroStyle: 'diagonal', fontHeading: 'Cormorant Garamond', fontBody: 'Source Sans Pro', borderRadius: 'large', shadowStyle: 'medium', navStyle: 'gradient', buttonStyle: 'pill' },
    pink: { primaryColor: '#DB2777', secondaryColor: '#9D174D', accentColor: '#34D399', bgColor: '#FDF2F8', template: 'vibrant', heroStyle: 'full-bg', fontHeading: 'Raleway', fontBody: 'Nunito', borderRadius: 'large', shadowStyle: 'soft', navStyle: 'transparent', buttonStyle: 'outline' },
    brown: { primaryColor: '#92400E', secondaryColor: '#78350F', accentColor: '#22C55E', bgColor: '#FEFCE8', template: 'classic', heroStyle: 'centered', fontHeading: 'Merriweather', fontBody: 'Georgia', borderRadius: 'small', shadowStyle: 'medium', navStyle: 'solid', buttonStyle: 'sharp' },
    cyan: { primaryColor: '#0891B2', secondaryColor: '#0E7490', accentColor: '#F43F5E', bgColor: '#ECFEFF', template: 'modern', heroStyle: 'split', fontHeading: 'Exo 2', fontBody: 'Roboto', borderRadius: 'medium', shadowStyle: 'soft', navStyle: 'gradient', buttonStyle: 'pill' },
    gold: { primaryColor: '#B45309', secondaryColor: '#92400E', accentColor: '#1D4ED8', bgColor: '#FFFBEB', template: 'elegant', heroStyle: 'diagonal', fontHeading: 'Cinzel', fontBody: 'Lato', borderRadius: 'none', shadowStyle: 'medium', navStyle: 'solid', buttonStyle: 'outline' },
    mint: { primaryColor: '#059669', secondaryColor: '#047857', accentColor: '#7C3AED', bgColor: '#ECFDF5', template: 'vibrant', heroStyle: 'centered', fontHeading: 'Poppins', fontBody: 'Inter', borderRadius: 'large', shadowStyle: 'soft', navStyle: 'transparent', buttonStyle: 'pill' },
    maroon: { primaryColor: '#881337', secondaryColor: '#4C0519', accentColor: '#F59E0B', bgColor: '#FFF1F2', template: 'bold', heroStyle: 'full-bg', fontHeading: 'Oswald', fontBody: 'Open Sans', borderRadius: 'small', shadowStyle: 'strong', navStyle: 'solid', buttonStyle: 'solid' },
    sky: { primaryColor: '#0369A1', secondaryColor: '#075985', accentColor: '#F97316', bgColor: '#F0F9FF', template: 'classic', heroStyle: 'split', fontHeading: 'Nunito', fontBody: 'DM Sans', borderRadius: 'medium', shadowStyle: 'medium', navStyle: 'gradient', buttonStyle: 'solid' },
    charcoal: { primaryColor: '#374151', secondaryColor: '#111827', accentColor: '#10B981', bgColor: '#F9FAFB', template: 'modern', heroStyle: 'diagonal', fontHeading: 'Plus Jakarta Sans', fontBody: 'Inter', borderRadius: 'large', shadowStyle: 'soft', navStyle: 'solid', buttonStyle: 'outline' },
};
function assignTheme(slug) {
    const presets = Object.keys(exports.THEME_PRESETS);
    let hash = 0;
    for (const c of slug)
        hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFFFF;
    return presets[Math.abs(hash) % presets.length];
}
let ThemesService = class ThemesService {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    async getSchoolTheme(slug) {
        const cacheKey = `theme:${slug}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const tenant = await this.prisma.tenant.findUnique({ where: { slug }, include: { schools: { take: 1 } } });
        if (!tenant)
            throw new common_1.NotFoundException('School not found');
        const school = tenant.schools[0];
        const settings = tenant.settings || {};
        const customTheme = settings.theme || {};
        const presetName = customTheme.preset || assignTheme(slug);
        const preset = exports.THEME_PRESETS[presetName] || exports.THEME_PRESETS.emerald;
        const safeSchool = school || {};
        const theme = {
            template: customTheme.template || preset.template || 'classic',
            primaryColor: customTheme.primaryColor || preset.primaryColor || '#059669',
            secondaryColor: customTheme.secondaryColor || preset.secondaryColor || '#065F46',
            accentColor: customTheme.accentColor || preset.accentColor || '#F59E0B',
            textColor: customTheme.textColor || '#1A2B3C',
            bgColor: customTheme.bgColor || preset.bgColor || '#FFFFFF',
            fontHeading: customTheme.fontHeading || preset.fontHeading || 'Plus Jakarta Sans',
            fontBody: customTheme.fontBody || preset.fontBody || 'Inter',
            heroStyle: customTheme.heroStyle || preset.heroStyle || 'centered',
            logoUrl: customTheme.logoUrl || tenant.logoUrl || '',
            logoShape: customTheme.logoShape || 'rounded',
            borderRadius: customTheme.borderRadius || preset.borderRadius || 'medium',
            shadowStyle: customTheme.shadowStyle || preset.shadowStyle || 'soft',
            navStyle: customTheme.navStyle || preset.navStyle || 'solid',
            buttonStyle: customTheme.buttonStyle || preset.buttonStyle || 'solid',
            schoolName: tenant.name,
            tagline: customTheme.tagline || settings.tagline || `Quality Education Since ${customTheme.established || '2000'}`,
            city: customTheme.city || safeSchool.address?.city || '',
            phone: customTheme.phone || safeSchool.phone || '',
            email: customTheme.email || safeSchool.email || tenant.email || '',
            address: customTheme.address || safeSchool.address?.full || '',
            established: customTheme.established || '2000',
            principalName: customTheme.principalName || '',
            coverImageUrl: customTheme.coverImageUrl || '',
            socialLinks: customTheme.socialLinks || {},
        };
        await this.cache.set(cacheKey, theme, 600);
        return theme;
    }
    async getSchoolThemeByDomain(domain) {
        const tenant = await this.prisma.tenant.findFirst({ where: { customDomain: domain } });
        if (!tenant)
            throw new common_1.NotFoundException('No school found for this domain');
        const theme = await this.getSchoolTheme(tenant.slug);
        return { slug: tenant.slug, theme };
    }
    async updateTheme(tenantId, theme) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        const currentSettings = tenant.settings || {};
        await this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: { ...currentSettings, theme: { ...(currentSettings.theme || {}), ...theme } } } });
        await this.cache.del(`theme:${tenant.slug}`);
    }
    getAvailablePresets() {
        return exports.THEME_PRESETS;
    }
    async getPortalSettings(tenantId) {
        const cacheKey = `portal-settings:${tenantId}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
        const settings = tenant?.settings || {};
        const saved = settings.portalSettings || {};
        const merged = {
            teacher: { ...DEFAULT_PORTAL_SETTINGS.teacher, ...(saved.teacher || {}) },
            student: { ...DEFAULT_PORTAL_SETTINGS.student, ...(saved.student || {}) },
            parent: { ...DEFAULT_PORTAL_SETTINGS.parent, ...(saved.parent || {}) },
            website: { ...DEFAULT_PORTAL_SETTINGS.website, ...(saved.website || {}) },
        };
        await this.cache.set(cacheKey, merged, 300);
        return merged;
    }
    async getPortalSettingsBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return this.getPortalSettings(tenant.id);
    }
    async updatePortalSettings(tenantId, settings) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        const currentSettings = tenant.settings || {};
        const current = currentSettings.portalSettings || {};
        const updated = {
            teacher: { ...(current.teacher || {}), ...(settings.teacher || {}) },
            student: { ...(current.student || {}), ...(settings.student || {}) },
            parent: { ...(current.parent || {}), ...(settings.parent || {}) },
            website: { ...(current.website || {}), ...(settings.website || {}) },
        };
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: { ...currentSettings, portalSettings: updated } },
        });
        await this.cache.del(`portal-settings:${tenantId}`);
        await this.cache.del(`theme:${tenant.slug}`);
        return this.getPortalSettings(tenantId);
    }
    async getNavConfig(tenantId) {
        const cacheKey = `nav-config:${tenantId}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
        const saved = (tenant?.settings || {}).navConfig || {};
        const result = {
            teacher: saved.teacher || DEFAULT_NAV_CONFIG.teacher,
            student: saved.student || DEFAULT_NAV_CONFIG.student,
            parent: saved.parent || DEFAULT_NAV_CONFIG.parent,
        };
        await this.cache.set(cacheKey, result, 300);
        return result;
    }
    async getNavConfigBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return this.getNavConfig(tenant.id);
    }
    async updateNavConfig(tenantId, config) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        const current = tenant.settings || {};
        const existing = current.navConfig || {};
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: { ...current, navConfig: { ...existing, ...config } } },
        });
        await this.cache.del(`nav-config:${tenantId}`);
        return this.getNavConfig(tenantId);
    }
    async getPortalBranding(tenantId) {
        const cacheKey = `portal-branding:${tenantId}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
        const saved = (tenant?.settings || {}).portalBranding || {};
        const result = {
            teacher: { ...DEFAULT_PORTAL_BRANDING.teacher, ...(saved.teacher || {}) },
            student: { ...DEFAULT_PORTAL_BRANDING.student, ...(saved.student || {}) },
            parent: { ...DEFAULT_PORTAL_BRANDING.parent, ...(saved.parent || {}) },
            admin: { ...DEFAULT_PORTAL_BRANDING.admin, ...(saved.admin || {}) },
        };
        await this.cache.set(cacheKey, result, 300);
        return result;
    }
    async getPortalBrandingBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return this.getPortalBranding(tenant.id);
    }
    async updatePortalBranding(tenantId, branding) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        const current = tenant.settings || {};
        const existing = current.portalBranding || {};
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: { ...current, portalBranding: { ...existing, ...branding } } },
        });
        await this.cache.del(`portal-branding:${tenantId}`);
        return this.getPortalBranding(tenantId);
    }
    async getAlertBanners(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
        const banners = (tenant?.settings || {}).alertBanners || [];
        const now = new Date().toISOString();
        return banners.filter(b => b.active && (!b.expiresAt || b.expiresAt > now));
    }
    async getAlertBannersBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
        if (!tenant)
            return [];
        return this.getAlertBanners(tenant.id);
    }
    async getAllAlertBanners(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
        return (tenant?.settings || {}).alertBanners || [];
    }
    async saveAlertBanners(tenantId, banners) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        const current = tenant.settings || {};
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: { ...current, alertBanners: banners } },
        });
        return banners;
    }
    async getPages(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
        const saved = (tenant?.settings || {}).pages || [];
        if (!saved.length)
            return DEFAULT_PAGES;
        const slugs = new Set(saved.map(p => p.slug));
        const merged = [...saved];
        for (const dp of DEFAULT_PAGES) {
            if (!slugs.has(dp.slug))
                merged.push(dp);
        }
        return merged;
    }
    async getPagesBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
        if (!tenant)
            return DEFAULT_PAGES;
        return this.getPages(tenant.id);
    }
    async savePage(tenantId, page) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        const current = tenant.settings || {};
        const pages = current.pages || DEFAULT_PAGES;
        const idx = pages.findIndex(p => p.slug === page.slug);
        const updated = { ...page, updatedAt: new Date().toISOString() };
        if (idx >= 0)
            pages[idx] = updated;
        else
            pages.push(updated);
        await this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: { ...current, pages } } });
        await this.cache.del(`theme:${tenant.slug}`);
        return pages;
    }
    async getDashboardWidgets(tenantId) {
        const cacheKey = `dashboard-widgets:${tenantId}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
        const saved = (tenant?.settings || {}).dashboardWidgets || {};
        const result = {
            teacher: saved.teacher || DEFAULT_WIDGETS.teacher,
            student: saved.student || DEFAULT_WIDGETS.student,
            parent: saved.parent || DEFAULT_WIDGETS.parent,
        };
        await this.cache.set(cacheKey, result, 300);
        return result;
    }
    async getDashboardWidgetsBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
        if (!tenant)
            return DEFAULT_WIDGETS;
        return this.getDashboardWidgets(tenant.id);
    }
    async updateDashboardWidgets(tenantId, widgets) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        const current = tenant.settings || {};
        const existing = current.dashboardWidgets || {};
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: { ...current, dashboardWidgets: { ...existing, ...widgets } } },
        });
        await this.cache.del(`dashboard-widgets:${tenantId}`);
        return this.getDashboardWidgets(tenantId);
    }
    async getLabelOverrides(tenantId) {
        const cacheKey = `labels:${tenantId}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
        const saved = (tenant?.settings || {}).labelOverrides || {};
        const defaults = {
            appName: 'MySchool', studentLabel: 'Student', teacherLabel: 'Teacher',
            parentLabel: 'Parent', classLabel: 'Class', sectionLabel: 'Section',
            feeLabel: 'Fee', attendanceLabel: 'Attendance', gradesLabel: 'Grades',
            admissionsLabel: 'Admissions', custom: {},
        };
        const result = { ...defaults, ...saved, custom: { ...(defaults.custom), ...(saved.custom || {}) } };
        await this.cache.set(cacheKey, result, 300);
        return result;
    }
    async getLabelOverridesBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
        if (!tenant)
            return { appName: 'MySchool', studentLabel: 'Student', teacherLabel: 'Teacher', parentLabel: 'Parent', classLabel: 'Class', sectionLabel: 'Section', feeLabel: 'Fee', attendanceLabel: 'Attendance', gradesLabel: 'Grades', admissionsLabel: 'Admissions', custom: {} };
        return this.getLabelOverrides(tenant.id);
    }
    async updateLabelOverrides(tenantId, labels) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
        const current = tenant.settings || {};
        const existing = current.labelOverrides || {};
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { settings: { ...current, labelOverrides: { ...existing, ...labels, custom: { ...(existing.custom || {}), ...(labels.custom || {}) } } } },
        });
        await this.cache.del(`labels:${tenantId}`);
        return this.getLabelOverrides(tenantId);
    }
    async getDomainInfo(tenantId) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId }, select: { slug: true, customDomain: true } });
        return { customDomain: tenant.customDomain || null, slug: tenant.slug };
    }
    async setCustomDomain(tenantId, customDomain) {
        const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId }, select: { slug: true } });
        if (customDomain) {
            const existing = await this.prisma.tenant.findFirst({ where: { customDomain, NOT: { id: tenantId } } });
            if (existing)
                throw new Error('Domain already in use by another school');
        }
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { customDomain: customDomain || null },
        });
        await this.cache.del(`tenant-domain:${customDomain}`);
        return { customDomain: customDomain || null, slug: tenant.slug };
    }
};
exports.ThemesService = ThemesService;
exports.ThemesService = ThemesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, cache_service_1.CacheService])
], ThemesService);
//# sourceMappingURL=themes.service.js.map