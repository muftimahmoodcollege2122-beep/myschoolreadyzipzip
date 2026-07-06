/**
 * School portal login page — login for students, teachers, parents under a specific school.
 * Submits to /auth/login with tenantSlug. Redirects to appropriate portal based on role.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolTheme } from '@/lib/school-data';
import { LoginPortalPage } from '@/components/school-website/pages/login-portal';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) return { title: 'School Not Found' };
  return { title: `Portal Login — ${theme.schoolName}`, description: `Login to your portal — Student, Parent, or Teacher portals at ${theme.schoolName}.` };
}

export default async function LoginRoute({ params }: { params: { slug: string } }) {
  const theme = await getSchoolTheme(params.slug);
  if (!theme) notFound();
  return <LoginPortalPage theme={theme} slug={params.slug} />;
}
