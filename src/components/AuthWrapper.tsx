
'use client';

import { AuthContextProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { LocationProvider } from '@/hooks/use-location';
import { ProductsProvider } from '@/hooks/use-products';
import { ReactNode } from 'react';
import { AdsProvider } from '@/hooks/use-ads';
import { HomeSheetProvider } from '@/hooks/use-home-sheet';

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      <ProductsProvider>
        <AdsProvider>
          <LocationProvider>
              <CartProvider>
                <HomeSheetProvider>
                  {children}
                </HomeSheetProvider>
              </CartProvider>
          </LocationProvider>
        </AdsProvider>
      </ProductsProvider>
    </AuthContextProvider>
  );
}
