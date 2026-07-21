/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: { missingSuspenseWithCSRBailout: false },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }];
  },
  async rewrites() {
    // API_INTERNAL_URL is server-only (not NEXT_PUBLIC_) so it never gets
    // baked into the client bundle. Always defaults to localhost:3001
    // which is where the NestJS API runs inside the container.
    // NEVER point this at the public Railway URL — that creates an infinite loop.
    const apiTarget = process.env.API_INTERNAL_URL || 'http://localhost:3099';
    return [
      { source: '/api/v1/:path*', destination: `${apiTarget}/api/v1/:path*` },
      { source: '/uploads/:path*', destination: `${apiTarget}/uploads/:path*` },
    ];
  },
};

module.exports = nextConfig;
