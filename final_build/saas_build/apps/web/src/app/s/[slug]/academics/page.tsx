/**
 * School Academics page — lists classes, subjects, curriculum offered by the school.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '@/lib/school-data';
import { AcademicsPage } from '@/components/school-website/pages/academics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `Academics — ${theme.schoolName}`, description: `Explore academic programs, subjects, timetable, and teaching methodology at ${theme.schoolName}.` };
}

export default async function AcademicsRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <AcademicsPage theme={theme} slug={params.slug} />;
}
