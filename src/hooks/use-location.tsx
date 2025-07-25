
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LocationContextType = {
  location: string;
  setLocation: (location: string) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState('Chandmari, South Tura');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        setLocationState(savedLocation);
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    } finally {
        setIsInitialized(true);
    }
  }, []);

  const setLocation = (newLocation: string) => {
    try {
      localStorage.setItem('userLocation', newLocation);
      setLocationState(newLocation);
    } catch (error) {
        console.error('Failed to set location in localStorage:', error);
    }
  };

  const value = {
      location,
      setLocation
  }

  return (
    <LocationContext.Provider value={value}>
      {isInitialized ? children : null}
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
