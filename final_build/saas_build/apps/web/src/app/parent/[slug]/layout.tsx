import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Parent Portal — EduOS',
  description: 'Parent portal to monitor your child\'s progress, attendance and fees',
};

export default function ParentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans antialiased">{children}</body>
    </html>
  );
}
