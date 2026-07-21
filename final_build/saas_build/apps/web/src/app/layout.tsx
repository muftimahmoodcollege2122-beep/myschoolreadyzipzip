/**
 * Root Next.js layout — wraps every page in the web app.
 * Applies global CSS, font imports, and React Query + Zustand providers.
 * Sets metadata: title, description, Open Graph tags for SEO.
 */

import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
export const metadata: Metadata = { title: 'MySchool App', description: "Pakistan's School Management SaaS" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
