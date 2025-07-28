
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' *.tile.openstreetmap.org; connect-src 'self' *.googleapis.com wss://*.firebaseapp.com; img-src 'self' data: *.tile.openstreetmap.org https://*; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' data:;",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
