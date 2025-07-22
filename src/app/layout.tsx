import type { Metadata } from 'next';
import './globals.css';
import AppLayoutClient from '@/components/app-layout-client';
import { Lato, Montserrat } from 'next/font/google';
import { cn } from '@/lib/utils';

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Sangma Megha Mart',
  description: 'Your friendly neighborhood online market.',
  viewport: 'width=device-width, initial-scale=1, user-scalable=no',
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
        lato.variable,
        montserrat.variable
      )}
    >
      <body className="font-body antialiased">
        <AppLayoutClient>{children}</AppLayoutClient>
      </body>
    </html>
  );
}
