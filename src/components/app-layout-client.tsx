'use client';

import { usePathname } from 'next/navigation';
import BottomNavbar from '@/components/bottom-navbar';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <CartProvider>
      {isLoginPage ? (
        <main>{children}</main>
      ) : (
        <>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
          </div>
          <BottomNavbar />
        </>
      )}
      <Toaster />
    </CartProvider>
  );
}
