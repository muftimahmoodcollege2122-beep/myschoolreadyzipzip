import { Metadata } from 'next';
import { SchoolWebsite } from '@/components/school-website/school-website';
import type { SchoolTheme } from '@/types/theme';

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

async function getTheme(slug: string): Promise<SchoolTheme | null> {
  try {
    const [themeRes, psRes] = await Promise.all([
      fetch(`${API}/api/v1/themes/school/${slug}`, { next: { revalidate: 300 } }),
      fetch(`${API}/api/v1/themes/portal-settings/slug/${slug}`, { next: { revalidate: 300 } }),
    ]);
    if (!themeRes.ok) return null;
    const theme: SchoolTheme = await themeRes.json();
    if (psRes.ok) {
      const ps = await psRes.json();
      const w = ps?.website || {};
      if (w.heroTitle)     theme.heroTitle     = w.heroTitle;
      if (w.heroSubtitle)  theme.heroSubtitle  = w.heroSubtitle;
      if (w.heroCtaText)   theme.heroCtaText   = w.heroCtaText;
      if (w.aboutText)     theme.aboutText     = w.aboutText;
      if (w.statsStudents) theme.statsStudents = w.statsStudents;
      if (w.statsTeachers) theme.statsTeachers = w.statsTeachers;
      if (w.statsYears)    theme.statsYears    = w.statsYears;
      if (w.statsPassRate) theme.statsPassRate = w.statsPassRate;
      theme.sections = {
        hero:         w.hero         !== false,
        about:        w.about        !== false,
        stats:        w.stats        !== false,
        gallery:      w.gallery      !== false,
        events:       w.events       !== false,
        admissions:   w.admissions   !== false,
        staff:        w.staff        !== false,
        testimonials: w.testimonials !== false,
        contact:      w.contact      !== false,
        news:         w.news         !== false,
      };
    }
    return theme;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return {
    title: `${theme.schoolName} — ${theme.city}`,
    description: theme.tagline,
    openGraph: { title: theme.schoolName, description: theme.tagline, images: theme.logoUrl ? [theme.logoUrl] : [] },
  };
}

export default async function SchoolPage({ params }: { params: { slug: string } }) {
  const theme = await getTheme(params.slug);
  if (!theme) {
    // Return a default theme so the page doesn't show "School Not Found"
    const defaultTheme: SchoolTheme = {
      template: 'classic',
      primaryColor: '#059669',
      secondaryColor: '#065F46',
      accentColor: '#F59E0B',
      textColor: '#1A2B3C',
      bgColor: '#FFFFFF',
      fontHeading: 'Plus Jakarta Sans',
      fontBody: 'Inter',
      heroStyle: 'centered',
      logoUrl: '',
      logoShape: 'rounded',
      borderRadius: 'medium',
      shadowStyle: 'soft',
      navStyle: 'solid',
      buttonStyle: 'solid',
      schoolName: params.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' School',
      tagline: 'Excellence in Education',
      city: '',
      phone: '',
      email: '',
      address: '',
      heroTitle: 'Welcome to Our School',
      heroSubtitle: 'Empowering students to achieve their full potential.',
      heroCtaText: 'Apply Now',
      aboutText: 'We are committed to providing quality education.',
      statsStudents: '500+',
      statsTeachers: '30+',
      statsYears: '10+',
      statsPassRate: '95%',
      sections: {
        hero: true, about: true, stats: true, gallery: false,
        events: false, admissions: true, staff: false,
        testimonials: false, contact: true, news: false,
      },
    } as any;
    return <SchoolWebsite theme={defaultTheme} slug={params.slug} />;
  }
  return <SchoolWebsite theme={theme} slug={params.slug} />;
}
