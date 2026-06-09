import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '../../../../lib/school-data';
import { GalleryPage } from '../../../../components/school-website/pages/gallery';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `Gallery — ${theme.schoolName}`, description: `Browse photos and videos from events, sports, academics, and campus life at ${theme.schoolName}.` };
}

export default async function GalleryRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <GalleryPage theme={theme} slug={params.slug} />;
}
