
import type { Metadata } from 'next';
import './globals.css';
import AppLayoutClient from '@/components/app-layout-client';
import { PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import SearchSheet from '@/components/tabs/search-tab';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Sangma Megha Mart',
  description: 'Your friendly neighborhood online market.',
  viewport: 'width=device-width, initial-scale=1.0',
  openGraph: {
    title: 'Sangma Megha Mart',
    description: 'Your friendly neighborhood online market.',
    url: 'https://sangmameghamart.com', // Replace with your actual domain
    siteName: 'Sangma Megha Mart',
    images: [
      {
        url: '/og-image.png', // It's a good practice to have an Open Graph image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(ptSans.variable)}
    >
      <body className="antialiased">
        <AppLayoutClient>
            {children}
            <Suspense>
              <SearchSheet />
            </Suspense>
        </AppLayoutClient>
      </body>
    </html>
  );
}
