
'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { LocationProvider } from '@/hooks/use-location';
import { ReactNode } from 'react';

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
        <LocationProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </LocationProvider>
    </AuthProvider>
  );
}
