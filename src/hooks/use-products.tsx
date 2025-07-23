
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';

type ProductsContextType = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productsCollection = collection(db, 'products');
    
    const unsubscribe = onSnapshot(
      productsCollection,
      (snapshot) => {
        if (snapshot.empty) {
            setProducts([]);
        } else {
            const productsList = snapshot.docs
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
                    } as Product;
                })
                .filter(product => product.stock > 0); // Filter out products with stock <= 0
            
            setProducts(productsList);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching products from Firestore:", err);
        let errorMessage = `Firestore error: ${err.message}.`;
        if ((err as any).code === 'permission-denied') {
            errorMessage += ' Please check your Firestore security rules.';
        }
        setError(errorMessage);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
