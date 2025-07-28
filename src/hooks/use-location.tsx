
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Address } from '@/lib/types';
import { useAuth } from './use-auth';
import { getUserData } from '@/lib/user';

type LocationContextType = {
  address: Address | null;
  setAddress: (address: Address) => void;
  loading: boolean;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const defaultAddress: Address = {
    id: 'guest-default',
    area: 'Chandmari',
    region: 'South Tura',
    phone: '',
    isDefault: true
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<Address | null>(null);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  const getLocalAddress = (): Address => {
    try {
        const savedAddress = localStorage.getItem('userAddress');
        return savedAddress ? JSON.parse(savedAddress) : defaultAddress;
    } catch (error) {
        console.error('Failed to parse address from localStorage', error);
        return defaultAddress;
    }
  };

  const saveLocalAddress = (addressToSave: Address) => {
      try {
        localStorage.setItem('userAddress', JSON.stringify(addressToSave));
      } catch (error) {
        console.error('Failed to save address to localStorage', error);
      }
  };

  useEffect(() => {
    const loadAddress = async () => {
        setLoading(true);
        if (user) {
            const userData = await getUserData(user.uid);
            const defaultUserAddress = userData.addresses?.find(a => a.isDefault) || userData.addresses?.[0];
            if (defaultUserAddress) {
                setAddressState(defaultUserAddress);
            } else {
                setAddressState(defaultAddress); // Fallback if user has no addresses
            }
        } else {
            setAddressState(getLocalAddress());
        }
        setLoading(false);
    };
    
    if (!authLoading) {
        loadAddress();
    }
  }, [user, authLoading]);


  const setAddress = useCallback((newAddress: Address) => {
    setAddressState(newAddress);
    if (!user) {
        saveLocalAddress(newAddress);
    }
    // For logged-in users, saving is handled by the component that calls this (e.g., AddressBook)
  }, [user]);

  const value = {
      address,
      setAddress,
      loading: authLoading || loading,
  }

  return (
    <LocationContext.Provider value={value}>
      {!loading ? children : null}
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
