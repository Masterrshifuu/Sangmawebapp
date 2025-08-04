

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Address } from '@/lib/types';
import { useAuth } from './use-auth';
import { getUserData } from '@/lib/user';

type LocationContextType = {
  address: Address | null;
  setAddress: (address: Address | null) => void;
  loading: boolean;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<Address | null>(null);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // This hook now primarily loads the default address for logged-in users.
  // Guest address is handled locally on the checkout page.
  useEffect(() => {
    const loadAddress = async () => {
        setLoading(true);
        if (user) {
            const userData = await getUserData(user.uid);
            const defaultUserAddress = userData.addresses?.find(a => a.isDefault) || userData.addresses?.[0];
            setAddressState(defaultUserAddress || null);
        } else {
            // For guests, we start with no address. It will be collected at checkout.
            setAddressState(null);
        }
        setLoading(false);
    };
    
    if (!authLoading) {
        loadAddress();
    }
  }, [user, authLoading]);


  const setAddress = useCallback((newAddress: Address | null) => {
    setAddressState(newAddress);
    // Saving logic is handled by the component that calls this.
    // e.g., Checkout page for guests, AddressBook for logged-in users.
  }, []);

  const value = {
      address,
      setAddress,
      loading: authLoading || loading,
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
