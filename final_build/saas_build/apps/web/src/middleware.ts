import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const PLATFORM_DOMAINS = ['localhost', 'replit.dev', 'repl.co', 'replit.app', 'railway.app', 'up.railway.app'];

function isPlatformDomain(hostname: string): boolean {
  return PLATFORM_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
}

export async function middleware(req: NextRequest) {
  const hostname = req.nextUrl.hostname;

  if (isPlatformDomain(hostname)) return NextResponse.next();

  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/s/') || pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/themes/by-domain/${encodeURIComponent(hostname)}`, { next: { revalidate: 300 } });

    if (res.ok) {
      const data = await res.json();
      const slug = data.slug;
      if (slug) {
        const url = req.nextUrl.clone();
        url.pathname = pathname === '/' ? `/s/${slug}` : `/s/${slug}${pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch {
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
