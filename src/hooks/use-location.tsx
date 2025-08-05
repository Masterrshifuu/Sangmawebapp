

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Address } from '@/lib/types';
import { useAuth } from './use-auth';
import { getUserData } from '@/lib/user';
import { v4 as uuidv4 } from 'uuid';

type LocationContextType = {
  address: Address | null;
  setAddress: (address: Address | null) => void;
  loading: boolean;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const GUEST_ADDRESS_KEY = 'sangma-megha-mart-guest-address';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<Address | null>(null);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Effect to load address from Firestore for logged-in users or localStorage for guests
  useEffect(() => {
    const loadAddress = async () => {
        setLoading(true);
        if (user) {
            // Logged-in user: load from Firestore
            localStorage.removeItem(GUEST_ADDRESS_KEY); // Clear any guest address
            const userData = await getUserData(user.uid);
            const defaultUserAddress = userData.addresses?.find(a => a.isDefault) || userData.addresses?.[0];
            setAddressState(defaultUserAddress || null);
        } else {
            // Guest user: load from localStorage
            try {
                const storedAddress = localStorage.getItem(GUEST_ADDRESS_KEY);
                if (storedAddress) {
                    setAddressState(JSON.parse(storedAddress));
                } else {
                    setAddressState(null);
                }
            } catch (error) {
                console.error("Failed to parse guest address from localStorage", error);
                setAddressState(null);
            }
        }
        setLoading(false);
    };
    
    if (!authLoading) {
        loadAddress();
    }
  }, [user, authLoading]);


  const setAddress = useCallback((newAddress: Address | null) => {
    setAddressState(newAddress);
    // For guests, we save directly to localStorage.
    // For logged-in users, the address is saved to Firestore upon placing an order.
    if (!user && newAddress) {
        try {
            localStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(newAddress));
        } catch (error) {
            console.error("Failed to save guest address to localStorage", error);
        }
    } else if (!user && !newAddress) {
        localStorage.removeItem(GUEST_ADDRESS_KEY);
    }
  }, [user]);

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
