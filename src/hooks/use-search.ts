
'use client';

import { useState, useEffect } from 'react';
import { itemRecommendation } from '@/ai/flows/item-recommendation';
import { searchProducts } from '@/lib/search';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

export function useSearch(open: boolean, isDesktop: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [searchSource, setSearchSource] = useState<'direct' | 'ai' | null>(null);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  useEffect(() => {
    // For desktop, we fetch initial products right away.
    // For mobile, we wait until the sheet is opened.
    if ((isDesktop || open) && !hasFetchedInitial) {
      const fetchInitialProducts = async () => {
        setIsLoading(true);
        setSearchSource(null);
        try {
          const allProducts = await getProducts();
          const bestsellers = allProducts.filter((p) => p.bestseller).slice(0, 15);
          const initialDisplay = bestsellers.length > 0 ? bestsellers : allProducts.slice(0, 15);

          setInitialProducts(initialDisplay);
          setResults(initialDisplay);
          if (initialDisplay.length > 0) {
            setSearchSource('direct');
          }
        } catch (error) {
          console.error('Failed to fetch initial products:', error);
          setInitialProducts([]);
          setResults([]);
        } finally {
          setIsLoading(false);
          setHasFetchedInitial(true);
        }
      };

      fetchInitialProducts();
    }
  }, [open, hasFetchedInitial, isDesktop]);

  useEffect(() => {
    if (!hasFetchedInitial) return;

    if (query.trim() === '') {
      setResults(initialProducts);
      setSearchSource(initialProducts.length > 0 ? 'direct' : null);
      return;
    }

    const debounceSearch = setTimeout(async () => {
      setIsLoading(true);
      setResults([]);
      setSearchSource(null);
      try {
        const directSearchResults = await searchProducts(query);

        if (directSearchResults.length > 0) {
          setResults(directSearchResults);
          setSearchSource('direct');
        } else {
          const result = await itemRecommendation({ searchInput: query });
          const mappedProducts: Product[] = result.recommendedProducts.map(
            (p, index) => ({
              id: `${p.name}-${index}`,
              ...p,
              category: 'Recommended',
              bestseller: false,
            })
          );
          setResults(mappedProducts);
          if (mappedProducts.length > 0) {
            setSearchSource('ai');
          }
        }
      } catch (error) {
        console.error('Failed to fetch search results:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceSearch);
  }, [query, hasFetchedInitial, initialProducts]);
  
  return { query, setQuery, results, isLoading, searchSource, hasFetchedInitial };
}
