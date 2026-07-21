import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Portal — EduOS',
  description: 'Student learning portal for assignments, grades and timetable',
};

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans antialiased">{children}</body>
    </html>
  );
}
