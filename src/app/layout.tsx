import type { Metadata } from 'next';
import './globals.css';
import AppLayoutClient from '@/components/app-layout-client';
import { PT_Sans, Poppins, Roboto } from 'next/font/google';
import { cn } from '@/lib/utils';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Sangma Megha Mart',
  description: 'Your friendly neighborhood online market.',
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
      className={cn(
        ptSans.variable,
        poppins.variable,
        roboto.variable
      )}
    >
      <body className="font-body antialiased">
        <AppLayoutClient>{children}</AppLayoutClient>
      </body>
    </html>
  );
}
