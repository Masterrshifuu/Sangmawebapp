
import type { Metadata } from 'next';
import './globals.css';
import { PT_Sans, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Toaster } from '@/components/ui/toaster';
import { ProductsProvider } from '@/hooks/use-products';
import { BottomNavbar } from '@/components/BottomNavbar';
import { AdsProvider } from '@/hooks/use-ads';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
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
      className={cn(ptSans.variable, poppins.variable)}
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
