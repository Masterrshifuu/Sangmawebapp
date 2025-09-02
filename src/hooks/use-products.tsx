
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  // Check for null or undefined explicitly
  if (value === null || value === undefined) return false;
    return value && typeof value.toDate === 'function';
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to cache the products data
  const cachedProducts = useRef<Product[] | null>(null);

  useEffect(() => {
    // Check if products are already cached
    if (cachedProducts.current) {
      setProducts(cachedProducts.current);
      setLoading(false);
      return; // Exit early if cached data exists
    }

    try {
      const productsCollection = collection(db, 'products');
    
    const unsubscribe = onSnapshot(
      productsCollection,
      (snapshot) => {
        if (snapshot.empty) {
            setProducts([]);
        } else {
            const products = snapshot.docs
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
 setProducts(products);
        }
        cachedProducts.current = products; // Cache the fetched data
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching products from Firestore:", err);
        let errorMessage = `Firestore error: ${err.message}.`;
        if ((err as any).code === 'permission-denied') {
            errorMessage += ' Please check your Firestore security rules. For development, you can allow reads on the products collection.';
        }
        setError(errorMessage);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
    } catch (error: any) {
      console.warn('Failed to initialize products listener:', error);
      setError(error.message);
      setLoading(false);
    }
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
