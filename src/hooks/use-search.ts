'use client';

import { useState, useEffect, useCallback } from 'react';
import { itemRecommendation } from '@/ai/flows/item-recommendation';
import type { Product } from '@/lib/types';
import { useData } from '@/context/data-context';

interface UseSearchProps {
  open: boolean;
  isDesktop?: boolean;
}

// Local search function using cached data
const filterProducts = (query: string, allProducts: Product[]): Product[] => {
  if (!query) return [];
  const lowerCaseQuery = query.toLowerCase();
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(lowerCaseQuery) ||
    product.category.toLowerCase().includes(lowerCaseQuery) ||
    product.description.toLowerCase().includes(lowerCaseQuery)
  );
};


export function useSearch({ open, isDesktop = false }: UseSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [searchSource, setSearchSource] = useState<'direct' | 'ai' | null>(null);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  const { products: allProducts, loading: dataLoading } = useData();

  const fetchInitialProducts = useCallback(() => {
    if (dataLoading || allProducts.length === 0) return;
    
    const bestsellers = allProducts.filter((p) => p.bestseller).slice(0, 15);
    const initialDisplay = bestsellers.length > 0 ? bestsellers : allProducts.slice(0, 15);

    setInitialProducts(initialDisplay);
    setResults(initialDisplay);
    if (initialDisplay.length > 0) {
      setSearchSource('direct');
    }
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
      setSearchSource(initialProducts.length > 0 ? 'direct' : null);
      return;
    }

    const debounceSearch = setTimeout(async () => {
      setIsLoading(true);
      setResults([]);
      setSearchSource(null);

      // Perform local search first
      const directSearchResults = filterProducts(query, allProducts);
      
      if (directSearchResults.length > 0) {
        setResults(directSearchResults);
        setSearchSource('direct');
        setIsLoading(false);
      } else {
        // Fallback to AI search if local search yields no results
        try {
          const result = await itemRecommendation({ searchInput: query });
          const mappedProducts: Product[] = result.recommendedProducts.map(
            (p, index) => ({
              id: `${p.name.replace(/\s/g, '-')}-${index}`, // Create a more stable key
              ...p,
              category: 'Recommended',
              bestseller: false,
            })
          );
          setResults(mappedProducts);
          if (mappedProducts.length > 0) {
            setSearchSource('ai');
          }
        } catch (error) {
          console.error('Failed to fetch AI search results:', error);
          // Handle AI search error, maybe show a toast
        } finally {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [query, hasFetchedInitial, initialProducts, allProducts]);
  
  return { query, setQuery, results, isLoading, searchSource, hasFetchedInitial };
}
