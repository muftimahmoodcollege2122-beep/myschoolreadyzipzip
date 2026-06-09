import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '../../../../lib/school-data';
import { AdmissionsPage } from '../../../../components/school-website/pages/admissions';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `Admissions ${new Date().getFullYear() + 1} — ${theme.schoolName}`, description: `Apply for admission to ${theme.schoolName}. View requirements, fee structure, and submit your application online.` };
}

export default async function AdmissionsRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <AdmissionsPage theme={theme} slug={params.slug} />;
}
