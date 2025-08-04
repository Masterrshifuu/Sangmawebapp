
'use client';

import { AuthContextProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { LocationProvider } from '@/hooks/use-location';
import { ProductsProvider } from '@/hooks/use-products';
import { ReactNode } from 'react';

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      <ProductsProvider>
        <LocationProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </LocationProvider>
      </ProductsProvider>
    </AuthContextProvider>
  );
}
