
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Ad } from '@/lib/types';

type AdsContextType = {
  ads: Ad[];
  loading: boolean;
  error: string | null;
};

const AdsContext = createContext<AdsContextType | undefined>(undefined);

function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

export function AdsProvider({ children }: { children: ReactNode }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adsCollection = collection(db, 'ads');
    const q = query(adsCollection, where('status', '==', 'active'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
            setAds([]);
        } else {
            const adsList = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    // Convert Firestore Timestamps to serializable ISO strings
                    for (const key in data) {
                        if (isTimestamp(data[key])) {
                            data[key] = data[key].toDate().toISOString();
                        }
                    }
                    return {
                        id: doc.id,
                        ...data
                    } as Ad;
                });
            
            setAds(adsList);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching ads from Firestore:", err);
        let errorMessage = `Firestore error: ${err.message}.`;
        if ((err as any).code === 'permission-denied') {
            errorMessage += ' Please check your Firestore security rules for the "ads" collection.';
        }
        setError(errorMessage);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AdsContext.Provider value={{ ads, loading, error }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
}
