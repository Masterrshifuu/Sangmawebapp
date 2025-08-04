
'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { LocationProvider } from '@/hooks/use-location';
import { ProductsProvider } from '@/hooks/use-products';
import { ReactNode } from 'react';

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProductsProvider>
        <LocationProvider>
            <CartProvider>
                {children}
            </Cart.Provider>
        </LocationProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
