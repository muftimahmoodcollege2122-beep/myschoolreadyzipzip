import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '../../../../lib/school-data';
import { NewsPage } from '../../../../components/school-website/pages/news';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `News & Notices — ${theme.schoolName}`, description: `Latest announcements, notices, exam schedules, and events from ${theme.schoolName}.` };
}

export default async function NewsRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <NewsPage theme={theme} slug={params.slug} />;
}
