import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

export interface SchoolTheme {
  template:       'classic' | 'modern' | 'bold' | 'elegant' | 'vibrant';
  primaryColor:   string;
  secondaryColor: string;
  accentColor:    string;
  textColor:      string;
  bgColor:        string;
  fontHeading:    string;
  fontBody:       string;
  heroStyle:      'centered' | 'split' | 'full-bg' | 'minimal' | 'diagonal';
  logoUrl:        string;
  logoShape:      'circle' | 'rounded' | 'square';
  borderRadius:   'none' | 'small' | 'medium' | 'large';
  shadowStyle:    'none' | 'soft' | 'medium' | 'strong';
  navStyle:       'solid' | 'transparent' | 'gradient' | 'outline';
  buttonStyle:    'solid' | 'outline' | 'pill' | 'sharp';
  schoolName:     string;
  tagline:        string;
  city:           string;
  phone:          string;
  email:          string;
  address:        string;
  established:    string;
  principalName:  string;
  coverImageUrl:  string;
  socialLinks:    { facebook?: string; twitter?: string; youtube?: string; instagram?: string };
}

export interface PortalSettings {
  teacher: {
    attendance: boolean; timetable: boolean; gradebook: boolean;
    lms: boolean; announcements: boolean; exams: boolean;
    lessonPlans: boolean; resources: boolean; students: boolean; assignments: boolean;
  };
  student: {
    timetable: boolean; assignments: boolean; grades: boolean;
    attendance: boolean; fees: boolean; announcements: boolean;
    resources: boolean; results: boolean; library: boolean;
  };
  parent: {
    attendance: boolean; grades: boolean; fees: boolean;
    timetable: boolean; announcements: boolean; assignments: boolean;
    results: boolean; transport: boolean;
  };
  website: {
    hero: boolean; about: boolean; stats: boolean; gallery: boolean;
    events: boolean; admissions: boolean; staff: boolean;
    testimonials: boolean; contact: boolean; news: boolean;
    heroTitle: string; heroSubtitle: string; heroCtaText: string;
    aboutText: string; statsStudents: string; statsTeachers: string;
    statsYears: string; statsPassRate: string;
  };
}

const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
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

// 20 pre-built distinct palettes — no two look alike
export const THEME_PRESETS: Record<string, Partial<SchoolTheme>> = {
  emerald:   { primaryColor: '#059669', secondaryColor: '#065F46', accentColor: '#F59E0B', bgColor: '#F0FDF4', template: 'classic',  heroStyle: 'centered',  fontHeading: 'Plus Jakarta Sans', fontBody: 'Inter',             borderRadius: 'medium', shadowStyle: 'soft',   navStyle: 'solid',       buttonStyle: 'solid'   },
  cobalt:    { primaryColor: '#2563EB', secondaryColor: '#1E40AF', accentColor: '#F97316', bgColor: '#EFF6FF', template: 'modern',   heroStyle: 'split',     fontHeading: 'Syne',              fontBody: 'DM Sans',           borderRadius: 'large',  shadowStyle: 'medium', navStyle: 'gradient',    buttonStyle: 'pill'    },
  crimson:   { primaryColor: '#DC2626', secondaryColor: '#991B1B', accentColor: '#FBBF24', bgColor: '#FFF5F5', template: 'bold',     heroStyle: 'full-bg',   fontHeading: 'Montserrat',        fontBody: 'Open Sans',         borderRadius: 'none',   shadowStyle: 'strong', navStyle: 'solid',       buttonStyle: 'sharp'   },
  violet:    { primaryColor: '#7C3AED', secondaryColor: '#5B21B6', accentColor: '#EC4899', bgColor: '#F5F3FF', template: 'elegant',  heroStyle: 'diagonal',  fontHeading: 'Cormorant Garamond',fontBody: 'Lato',              borderRadius: 'large',  shadowStyle: 'soft',   navStyle: 'transparent', buttonStyle: 'outline' },
  amber:     { primaryColor: '#D97706', secondaryColor: '#92400E', accentColor: '#10B981', bgColor: '#FFFBEB', template: 'vibrant',  heroStyle: 'centered',  fontHeading: 'Raleway',           fontBody: 'Source Sans Pro',   borderRadius: 'medium', shadowStyle: 'medium', navStyle: 'gradient',    buttonStyle: 'pill'    },
  teal:      { primaryColor: '#0D9488', secondaryColor: '#115E59', accentColor: '#8B5CF6', bgColor: '#F0FDFA', template: 'modern',   heroStyle: 'split',     fontHeading: 'Nunito',            fontBody: 'Roboto',            borderRadius: 'large',  shadowStyle: 'soft',   navStyle: 'solid',       buttonStyle: 'solid'   },
  navy:      { primaryColor: '#1E3A5F', secondaryColor: '#0F2137', accentColor: '#F59E0B', bgColor: '#F8FAFF', template: 'elegant',  heroStyle: 'centered',  fontHeading: 'Playfair Display',  fontBody: 'Lato',              borderRadius: 'small',  shadowStyle: 'medium', navStyle: 'solid',       buttonStyle: 'outline' },
  rose:      { primaryColor: '#E11D48', secondaryColor: '#9F1239', accentColor: '#06B6D4', bgColor: '#FFF1F2', template: 'vibrant',  heroStyle: 'diagonal',  fontHeading: 'Syne',              fontBody: 'DM Sans',           borderRadius: 'large',  shadowStyle: 'soft',   navStyle: 'gradient',    buttonStyle: 'pill'    },
  forest:    { primaryColor: '#15803D', secondaryColor: '#14532D', accentColor: '#CA8A04', bgColor: '#F0FDF4', template: 'classic',  heroStyle: 'full-bg',   fontHeading: 'Oswald',            fontBody: 'Open Sans',         borderRadius: 'none',   shadowStyle: 'strong', navStyle: 'solid',       buttonStyle: 'sharp'   },
  slate:     { primaryColor: '#475569', secondaryColor: '#1E293B', accentColor: '#38BDF8', bgColor: '#F8FAFC', template: 'modern',   heroStyle: 'split',     fontHeading: 'Plus Jakarta Sans', fontBody: 'Inter',             borderRadius: 'medium', shadowStyle: 'soft',   navStyle: 'transparent', buttonStyle: 'solid'   },
  orange:    { primaryColor: '#EA580C', secondaryColor: '#9A3412', accentColor: '#0EA5E9', bgColor: '#FFF7ED', template: 'bold',     heroStyle: 'centered',  fontHeading: 'Bebas Neue',        fontBody: 'Roboto',            borderRadius: 'small',  shadowStyle: 'strong', navStyle: 'solid',       buttonStyle: 'solid'   },
  indigo:    { primaryColor: '#4338CA', secondaryColor: '#312E81', accentColor: '#F59E0B', bgColor: '#EEF2FF', template: 'elegant',  heroStyle: 'diagonal',  fontHeading: 'Cormorant Garamond',fontBody: 'Source Sans Pro',   borderRadius: 'large',  shadowStyle: 'medium', navStyle: 'gradient',    buttonStyle: 'pill'    },
  pink:      { primaryColor: '#DB2777', secondaryColor: '#9D174D', accentColor: '#34D399', bgColor: '#FDF2F8', template: 'vibrant',  heroStyle: 'full-bg',   fontHeading: 'Raleway',           fontBody: 'Nunito',            borderRadius: 'large',  shadowStyle: 'soft',   navStyle: 'transparent', buttonStyle: 'outline' },
  brown:     { primaryColor: '#92400E', secondaryColor: '#78350F', accentColor: '#22C55E', bgColor: '#FEFCE8', template: 'classic',  heroStyle: 'centered',  fontHeading: 'Merriweather',      fontBody: 'Georgia',           borderRadius: 'small',  shadowStyle: 'medium', navStyle: 'solid',       buttonStyle: 'sharp'   },
  cyan:      { primaryColor: '#0891B2', secondaryColor: '#0E7490', accentColor: '#F43F5E', bgColor: '#ECFEFF', template: 'modern',   heroStyle: 'split',     fontHeading: 'Exo 2',             fontBody: 'Roboto',            borderRadius: 'medium', shadowStyle: 'soft',   navStyle: 'gradient',    buttonStyle: 'pill'    },
  gold:      { primaryColor: '#B45309', secondaryColor: '#92400E', accentColor: '#1D4ED8', bgColor: '#FFFBEB', template: 'elegant',  heroStyle: 'diagonal',  fontHeading: 'Cinzel',            fontBody: 'Lato',              borderRadius: 'none',   shadowStyle: 'medium', navStyle: 'solid',       buttonStyle: 'outline' },
  mint:      { primaryColor: '#059669', secondaryColor: '#047857', accentColor: '#7C3AED', bgColor: '#ECFDF5', template: 'vibrant',  heroStyle: 'centered',  fontHeading: 'Poppins',           fontBody: 'Inter',             borderRadius: 'large',  shadowStyle: 'soft',   navStyle: 'transparent', buttonStyle: 'pill'    },
  maroon:    { primaryColor: '#881337', secondaryColor: '#4C0519', accentColor: '#F59E0B', bgColor: '#FFF1F2', template: 'bold',     heroStyle: 'full-bg',   fontHeading: 'Oswald',            fontBody: 'Open Sans',         borderRadius: 'small',  shadowStyle: 'strong', navStyle: 'solid',       buttonStyle: 'solid'   },
  sky:       { primaryColor: '#0369A1', secondaryColor: '#075985', accentColor: '#F97316', bgColor: '#F0F9FF', template: 'classic',  heroStyle: 'split',     fontHeading: 'Nunito',            fontBody: 'DM Sans',           borderRadius: 'medium', shadowStyle: 'medium', navStyle: 'gradient',    buttonStyle: 'solid'   },
  charcoal:  { primaryColor: '#374151', secondaryColor: '#111827', accentColor: '#10B981', bgColor: '#F9FAFB', template: 'modern',   heroStyle: 'diagonal',  fontHeading: 'Plus Jakarta Sans', fontBody: 'Inter',             borderRadius: 'large',  shadowStyle: 'soft',   navStyle: 'solid',       buttonStyle: 'outline' },
};

// Assign a deterministic theme to a school based on slug
function assignTheme(slug: string): string {
  const presets = Object.keys(THEME_PRESETS);
  let hash = 0;
  for (const c of slug) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFFFF;
  return presets[Math.abs(hash) % presets.length];
}

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService, private readonly cache: CacheService) {}

  async getSchoolTheme(slug: string): Promise<SchoolTheme> {
    const cacheKey = `theme:${slug}`;
    const cached = await this.cache.get<SchoolTheme>(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({ where: { slug }, include: { schools: { take: 1 } } });
    if (!tenant) throw new NotFoundException('School not found');

    const school = tenant.schools[0];
    const settings = (tenant.settings as any) || {};
    const customTheme = settings.theme || {};
    const presetName = customTheme.preset || assignTheme(slug);
    const preset = THEME_PRESETS[presetName] || THEME_PRESETS.emerald;

    const safeSchool = school || {} as any;
    const theme: SchoolTheme = {
      template:      customTheme.template      || preset.template      || 'classic',
      primaryColor:  customTheme.primaryColor  || preset.primaryColor  || '#059669',
      secondaryColor:customTheme.secondaryColor|| preset.secondaryColor|| '#065F46',
      accentColor:   customTheme.accentColor   || preset.accentColor   || '#F59E0B',
      textColor:     customTheme.textColor     || '#1A2B3C',
      bgColor:       customTheme.bgColor       || preset.bgColor       || '#FFFFFF',
      fontHeading:   customTheme.fontHeading   || preset.fontHeading   || 'Plus Jakarta Sans',
      fontBody:      customTheme.fontBody      || preset.fontBody      || 'Inter',
      heroStyle:     customTheme.heroStyle     || preset.heroStyle     || 'centered',
      logoUrl:       customTheme.logoUrl       || (tenant as any).logoUrl || '',
      logoShape:     customTheme.logoShape     || 'rounded',
      borderRadius:  customTheme.borderRadius  || preset.borderRadius  || 'medium',
      shadowStyle:   customTheme.shadowStyle   || preset.shadowStyle   || 'soft',
      navStyle:      customTheme.navStyle      || preset.navStyle      || 'solid',
      buttonStyle:   customTheme.buttonStyle   || preset.buttonStyle   || 'solid',
      schoolName:    tenant.name,
      tagline:       customTheme.tagline       || settings.tagline     || `Quality Education Since ${customTheme.established || '2000'}`,
      city:          customTheme.city          || (safeSchool.address as any)?.city || '',
      phone:         customTheme.phone         || safeSchool.phone     || '',
      email:         customTheme.email         || safeSchool.email     || (tenant as any).email || '',
      address:       customTheme.address       || (safeSchool.address as any)?.full || '',
      established:   customTheme.established   || '2000',
      principalName: customTheme.principalName || '',
      coverImageUrl: customTheme.coverImageUrl || '',
      socialLinks:   customTheme.socialLinks   || {},
    };

    await this.cache.set(cacheKey, theme, 600);
    return theme;
  }

  async getSchoolThemeByDomain(domain: string): Promise<{ slug: string; theme: SchoolTheme }> {
    const tenant = await this.prisma.tenant.findFirst({ where: { customDomain: domain } });
    if (!tenant) throw new NotFoundException('No school found for this domain');
    const theme = await this.getSchoolTheme(tenant.slug);
    return { slug: tenant.slug, theme };
  }

  async updateTheme(tenantId: string, theme: Partial<SchoolTheme>): Promise<void> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    const currentSettings = (tenant.settings as any) || {};
    await this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: { ...currentSettings, theme: { ...(currentSettings.theme || {}), ...theme } } } });
    await this.cache.del(`theme:${tenant.slug}`);
  }

  getAvailablePresets(): Record<string, Partial<SchoolTheme>> {
    return THEME_PRESETS;
  }

  // ── Portal Settings ────────────────────────────────────────────────────────

  async getPortalSettings(tenantId: string): Promise<PortalSettings> {
    const cacheKey = `portal-settings:${tenantId}`;
    const cached = await this.cache.get<PortalSettings>(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
    const settings = (tenant?.settings as any) || {};
    const saved = settings.portalSettings || {};

    const merged: PortalSettings = {
      teacher: { ...DEFAULT_PORTAL_SETTINGS.teacher, ...(saved.teacher || {}) },
      student: { ...DEFAULT_PORTAL_SETTINGS.student, ...(saved.student || {}) },
      parent:  { ...DEFAULT_PORTAL_SETTINGS.parent,  ...(saved.parent  || {}) },
      website: { ...DEFAULT_PORTAL_SETTINGS.website, ...(saved.website || {}) },
    };

    await this.cache.set(cacheKey, merged, 300);
    return merged;
  }

  async getPortalSettingsBySlug(slug: string): Promise<PortalSettings> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return this.getPortalSettings(tenant.id);
  }

  async updatePortalSettings(tenantId: string, settings: Partial<PortalSettings>): Promise<PortalSettings> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
    const currentSettings = (tenant.settings as any) || {};
    const current = currentSettings.portalSettings || {};

    const updated = {
      teacher: { ...(current.teacher || {}), ...(settings.teacher || {}) },
      student: { ...(current.student || {}), ...(settings.student || {}) },
      parent:  { ...(current.parent  || {}), ...(settings.parent  || {}) },
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

  // ── Custom Domain ──────────────────────────────────────────────────────────

  async getDomainInfo(tenantId: string): Promise<{ customDomain: string | null; slug: string }> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId }, select: { slug: true, customDomain: true } });
    return { customDomain: tenant.customDomain || null, slug: tenant.slug };
  }

  async setCustomDomain(tenantId: string, customDomain: string | null): Promise<{ customDomain: string | null; slug: string }> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId }, select: { slug: true } });

    if (customDomain) {
      const existing = await this.prisma.tenant.findFirst({ where: { customDomain, NOT: { id: tenantId } } });
      if (existing) throw new Error('Domain already in use by another school');
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { customDomain: customDomain || null },
    });
    await this.cache.del(`tenant-domain:${customDomain}`);
    return { customDomain: customDomain || null, slug: tenant.slug };
  }
}
