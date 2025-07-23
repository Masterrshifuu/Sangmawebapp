
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { useData } from '@/context/data-context';
import Fuse from 'fuse.js';
import { trackSearch } from '@/lib/activity-tracker';

interface UseSearchProps {
  open: boolean;
  isDesktop?: boolean;
}

export function useSearch({ open, isDesktop = false }: UseSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  const { products: allProducts, loading: dataLoading } = useData();

  const fuse = useMemo(() => {
    if (allProducts.length > 0) {
      return new Fuse(allProducts, {
        keys: ['name', 'category', 'description'],
        threshold: 0.3, // Adjust for more or less strict matching
        includeScore: true,
      });
    }
    return null;
  }, [allProducts]);

  const fetchInitialProducts = useCallback(() => {
    if (dataLoading || allProducts.length === 0) return;
    
    const bestsellers = allProducts.filter((p) => p.bestseller).slice(0, 15);
    const initialDisplay = bestsellers.length > 0 ? bestsellers : allProducts.slice(0, 15);

    setInitialProducts(initialDisplay);
    setResults(initialDisplay);
    setHasFetchedInitial(true);
    
  }, [allProducts, dataLoading]);


  useEffect(() => {
    // Fetch initial products once data is loaded and the search component is active
    if (!dataLoading && (open || isDesktop) && !hasFetchedInitial) {
      fetchInitialProducts();
    }
  }, [open, isDesktop, hasFetchedInitial, dataLoading, fetchInitialProducts]);


  useEffect(() => {
    if (!hasFetchedInitial) return;

    // If query is cleared, show initial products again
    if (query.trim() === '') {
      setResults(initialProducts);
      return;
    }
    
    if (!fuse) return;

    setIsLoading(true);
    // Debounce tracking to avoid logging every keystroke
    const handler = setTimeout(() => {
      trackSearch(query);
    }, 500);

    const searchResults = fuse.search(query).map(result => result.item);
    setResults(searchResults);
    setIsLoading(false);

    return () => {
      clearTimeout(handler);
    };

  }, [query, fuse, hasFetchedInitial, initialProducts]);
  
  return { query, setQuery, results, isLoading, hasFetchedInitial };
}
