/**
 * School About page — shows school history, mission, vision, faculty highlights.
 * Part of the per-tenant school website. All content managed from admin dashboard.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '@/lib/school-data';
import { AboutPage } from '@/components/school-website/pages/about';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `About Us — ${theme.schoolName}`, description: `Learn about ${theme.schoolName}'s history, vision, staff, and facilities.` };
}

export default async function AboutRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <AboutPage theme={theme} slug={params.slug} />;
}
