import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ton.org' },
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'cache.tonapi.io' },
      { protocol: 'https', hostname: 'static.ston.fi' },
    ],
  },
};

export default nextConfig;
