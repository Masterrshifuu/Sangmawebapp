
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { listenToProducts, listenToCategories } from "@/lib/data-realtime";
import type { Product, Category } from '@/lib/types';

interface DataContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeProducts = listenToProducts((newProducts) => {
        setProducts(newProducts);
        if (loading) setLoading(false);
    });
    
    const unsubscribeCategories = listenToCategories((newCategories) => {
        setCategories(newCategories);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, [loading]);

  const value = {
    products,
    categories,
    loading
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
