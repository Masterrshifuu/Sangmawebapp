
import type { Metadata } from 'next';
import './globals.css';
import { Noto_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import HomeSheetManager from '@/components/HomeSheetManager';


const noto = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans',
});

const siteUrl = 'https://sangmameghamart.com';
const GTAG_ID = 'AW-17455424479';

export const metadata: Metadata = {
  title: 'Sangma Megha Mart | Instant Grocery Delivery in Tura, Meghalaya',
  description: 'The fastest grocery delivery service in Tura. Get your items with speed and convenience. Order from Sangma Megha Mart for instant delivery to your doorstep.',
  keywords: ['Sangma Megha Mart', 'Sangmameghamart', 'Sangmamart', 'Tura Mart', 'Tura Grocery', 'Online Grocery Tura', 'Meghalaya', 'fast delivery', 'instant delivery', 'convenience', 'speed', 'sangma'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Sangma Megha Mart',
    title: 'Sangma Megha Mart | Instant Grocery Delivery in Tura',
    description: 'The fastest and most convenient grocery delivery in Tura, Meghalaya. Your order delivered with speed.',
    images: [
      {
        url: `${siteUrl}/adog.png`,
        width: 1200,
        height: 630,
        alt: 'Sangma Megha Mart - Fast Grocery Delivery in Tura',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sangma Megha Mart | Instant Grocery Delivery in Tura',
    description: 'The fastest and most convenient grocery delivery in Tura, Meghalaya. Your order delivered with speed.',
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
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GTAG_ID}');
          `}
        </Script>
        <AuthWrapper>
            <div className="flex flex-col min-h-screen">
                <div className="flex-grow pb-16 md:pb-0">
                    {children}
                </div>
                <Toaster />
                <HomeSheetManager />
            </div>
        </AuthWrapper>
      </body>
    </html>
  );
}
