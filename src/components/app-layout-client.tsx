'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import BottomNavbar from '@/components/bottom-navbar';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/';

  return (
    <CartProvider>
      {isLoginPage ? (
        <main>{children}</main>
      ) : (
        <>
          <div className="relative flex min-h-screen flex-col">
            {isHomePage && <Header />}
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            {isHomePage && <Footer />}
          </div>
          <BottomNavbar />
        </>
      )}
      <Toaster />
    </CartProvider>
  );
}
