
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // This prevents a restart loop with the Genkit watcher.
    watchOptions: {
      ignored: ['**/.genkit/**'],
    },
  },
};

export default nextConfig;
