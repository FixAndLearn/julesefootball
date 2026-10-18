/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ],
  redirects: async () => [
    {
      source: '/seller/orders/:id',
      destination: '/orders/:id',
      permanent: true,
    },
    {
      source: '/seller/orders',
      destination: '/dashboard/seller',
      permanent: true,
    },
    {
      source: '/seller/dashboard',
      destination: '/dashboard/seller',
      permanent: true,
    },
    {
      source: '/seller',
      destination: '/dashboard/seller',
      permanent: true,
    },
  ],
};

export default nextConfig;
