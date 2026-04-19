import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['purifier-astound-gruffly.ngrok-free.app'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ton.org' },
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'cache.tonapi.io' },
      { protocol: 'https', hostname: 'static.ston.fi' },
    ],
    domains: ['s2.coinmarketcap.com'],
  },

};

export default nextConfig;
