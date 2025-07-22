'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { DataProvider } from '@/context/data-context';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <DataProvider>
      <CartProvider>
        {isLoginPage ? (
          <main>{children}</main>
        ) : (
           <main className="flex-1">{children}</main>
        )}
        <Toaster />
      </CartProvider>
    </DataProvider>
  );
}
