import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Portal — EduOS',
  description: 'Teacher portal for managing classes, attendance, grades and more',
};

export default function TeacherPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans antialiased">{children}</body>
    </html>
  );
}
