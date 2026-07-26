/**
 * Root Next.js layout — wraps every page in the web app.
 * Applies global CSS, font imports, and React Query + Zustand providers.
 * Sets metadata: title, description, Open Graph tags for SEO.
 */

/**
 * Root Next.js layout — wraps every page in the web app.
 * Applies global CSS, font imports, and React Query + Zustand providers.
 * Sets metadata: title, description, Open Graph tags for SEO.
 */

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = { title: 'MySchool App', description: "Pakistan's School Management SaaS" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
