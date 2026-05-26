import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SchoolWebsite } from '../../../components/school-website/school-website';
import type { SchoolTheme } from '../../../types/theme';

async function getTheme(slug: string): Promise<SchoolTheme | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/themes/school/${slug}`, {
      next: { revalidate: 300 }, // ISR - refresh every 5 min
    });
    if (!res.ok) return null;
    return res.json();
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
