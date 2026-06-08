/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  experimental: { serverComponentsExternalPackages: [] },
  async rewrites() {
    return [{
      source: '/api/v1/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/:path*`,
    }];
  },
};
module.exports = nextConfig;
