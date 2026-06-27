import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '@/lib/school-data';
import { ResultsPage } from '@/components/school-website/pages/results';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `Exam Results — ${theme.schoolName}`, description: `Search exam results by roll number at ${theme.schoolName}. Annual and half-yearly results.` };
}

export default async function ResultsRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <ResultsPage theme={theme} slug={params.slug} />;
}
