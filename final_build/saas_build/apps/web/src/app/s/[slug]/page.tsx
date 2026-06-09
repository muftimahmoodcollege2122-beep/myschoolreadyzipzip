import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SchoolWebsite } from '../../../components/school-website/school-website';
import type { SchoolTheme } from '../../../types/theme';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  if (!theme) notFound();
  return <SchoolWebsite theme={theme} slug={params.slug} />;
}
