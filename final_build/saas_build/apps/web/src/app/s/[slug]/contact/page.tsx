import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '@/lib/school-data';
import { ContactPage } from '@/components/school-website/pages/contact';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `Contact Us — ${theme.schoolName}`, description: `Get in touch with ${theme.schoolName}. Phone, email, address, and contact form.` };
}

export default async function ContactRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <ContactPage theme={theme} slug={params.slug} />;
}
