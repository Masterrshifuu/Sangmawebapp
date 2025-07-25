
import type { Metadata } from 'next';
import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Toaster } from '@/components/ui/toaster';
import { ProductsProvider } from '@/hooks/use-products';
import { BottomNavbar } from '@/components/BottomNavbar';
import { AdsProvider } from '@/hooks/use-ads';
import 'leaflet/dist/leaflet.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Sangma Megha Mart',
  description: 'Your one-stop shop for everything you need.',
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
      className={cn(inter.variable, poppins.variable)}
    >
      <body className="antialiased">
        <AuthWrapper>
          <ProductsProvider>
            <AdsProvider>
              {children}
              <Toaster />
              <BottomNavbar />
            </AdsProvider>
          </ProductsProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}
