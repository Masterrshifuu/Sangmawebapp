
import type { Metadata } from 'next';
import './globals.css';
import { Noto_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Toaster } from '@/components/ui/toaster';
import { BottomNavbar } from '@/components/BottomNavbar';

const noto = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sangma-megha-mart.com';

export const metadata: Metadata = {
  title: 'Sangma Megha Mart | Online Grocery Shopping in Tura',
  description: 'Your one-stop shop for online grocery in Tura. Order fresh vegetables, snacks, and household essentials from Sangma Megha Mart for fast delivery.',
  keywords: ['Sangmamart', 'Sangma Megha mart', 'Sangma Mart', 'Tura Mart', 'Tura Grocery', 'Online Grocery Tura'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Sangma Megha Mart',
    title: 'Sangma Megha Mart | Online Grocery Shopping in Tura',
    description: 'Fast delivery of fresh groceries in Tura, Meghalaya.',
    images: [
      {
        url: `${siteUrl}/adog.png`,
        width: 1200,
        height: 630,
        alt: 'Sangma Megha Mart',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sangma Megha Mart | Online Grocery Shopping in Tura',
    description: 'Fast delivery of fresh groceries in Tura, Meghalaya.',
    images: [`${siteUrl}/adog.png`],
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
      className={cn(noto.variable)}
    >
      <head />
      <body className="antialiased">
        <AuthWrapper>
            <div className="flex flex-col min-h-screen">
                <div className="flex-grow pb-16 md:pb-0">
                    {children}
                </div>
                <Toaster />
                <BottomNavbar />
            </div>
        </AuthWrapper>
      </body>
    </html>
  );
}
