import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '../../../../lib/school-data';
import { FeesPage } from '../../../../components/school-website/pages/fees';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `Fee Structure — ${theme.schoolName}`, description: `View complete fee structure, payment methods, and due dates at ${theme.schoolName}.` };
}

export default async function FeesRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <FeesPage theme={theme} slug={params.slug} />;
}
