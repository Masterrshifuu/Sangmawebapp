
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useData } from '@/context/data-context';
import Fuse from 'fuse.js';
import { trackSearch } from '@/lib/activity-tracker';
import { useSearchContext } from '@/context/search-context';

interface UseSearchProps {
  open: boolean;
}

export function useSearch({ open }: UseSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  const { query } = useSearchContext();
  const { products: allProducts, loading: dataLoading } = useData();

  const fuse = useMemo(() => {
    if (allProducts.length > 0) {
      return new Fuse(allProducts, {
        keys: ['name', 'category', 'description'],
        threshold: 0.3,
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
    if (query.trim() === '') {
      setResults(initialDisplay);
    }
    setHasFetchedInitial(true);
    
  }, [allProducts, dataLoading, query]);


  useEffect(() => {
    if (!dataLoading && open && !hasFetchedInitial) {
      fetchInitialProducts();
    }
  }, [open, hasFetchedInitial, dataLoading, fetchInitialProducts]);


  useEffect(() => {
    if (!hasFetchedInitial) return;

    if (query.trim() === '') {
      setResults(initialProducts);
      return;
    }
    
    if (!fuse) return;

    setIsLoading(true);
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
  
  return { results, isLoading, hasFetchedInitial };
}
