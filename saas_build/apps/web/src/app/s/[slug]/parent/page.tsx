import { PortalLoginPage } from '../../../../components/school-website/portal-login';

export default function ParentPortalPage({ params }: { params: { slug: string } }) {
  return <PortalLoginPage slug={params.slug} role="parent" />;
}
