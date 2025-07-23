
'use client';

import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { DataProvider } from '@/context/data-context';
import { SearchProvider } from '@/context/search-context';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {

  return (
    <DataProvider>
      <CartProvider>
        <SearchProvider>
            {children}
            <Toaster />
        </SearchProvider>
      </CartProvider>
    </DataProvider>
  );
}
