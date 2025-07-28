
import type { Metadata } from 'next';
import './globals.css';
import { Noto_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Toaster } from '@/components/ui/toaster';
import { BottomNavbar } from '@/components/BottomNavbar';
import { AdsProvider } from '@/hooks/use-ads';
import 'leaflet/dist/leaflet.css';
import { ProductsProvider } from '@/hooks/use-products';
import { JsonLdSchema } from '@/components/JsonLdSchema';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sangmameghamart.com'),
  title: {
    default: 'Sangma Megha Mart | Online Grocery in Tura',
    template: '%s | Sangma Megha Mart',
  },
  description: 'Sangma Megha Mart (also known as Sangma Mart) is the top spot for online grocery in Tura, Meghalaya. Get fast delivery from Sangma Megha. Order now!',
  keywords: ['Sangma Megha Mart', 'Sangma Megha', 'Sangma Mart', 'Mart Sangma', 'Grocery Tura', 'online grocery tura', 'meghalaya grocery', 'fast delivery', 'tura shopping'],
  openGraph: {
    title: 'Sangma Megha Mart',
    description: 'The easiest way to shop for groceries in Tura.',
    url: 'https://sangmameghamart.com',
    siteName: 'Sangma Megha Mart',
    locale: 'en_US',
    type: 'website',
  }
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
      className={cn(notoSans.variable)}
    >
      <head>
        <JsonLdSchema />
      </head>
      <body className="antialiased">
        <AuthWrapper>
          <ProductsProvider>
            <AdsProvider>
              <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                  {children}
                </div>
                <Toaster />
                <BottomNavbar />
              </div>
            </AdsProvider>
          </ProductsProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}
