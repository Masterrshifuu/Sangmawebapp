'use client';

import ProductCard from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { useSearch } from '@/hooks/use-search';

type SearchResultsProps = Omit<ReturnType<typeof useSearch>, 'query' | 'setQuery'> & {
  query: string;
  onProductClick: () => void;
};

export function SearchResults({
  results,
  isLoading,
  searchSource,
  hasFetchedInitial,
  query,
  onProductClick,
}: SearchResultsProps) {
  if (isLoading && results.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoading && results.length > 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold font-headline">
            {query.trim() ? 'Search Results' : 'Featured Products'}
          </h3>
          {searchSource === 'ai' && (
            <Badge variant="secondary">
              <Bot className="w-4 h-4 mr-2" />
              AI-powered
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              size="small"
              onProductClick={onProductClick}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && results.length === 0 && (query || hasFetchedInitial)) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No products found for &quot;{query}&quot;.</p>
        <p className="text-sm">Try searching for something else.</p>
      </div>
    );
  }

  return null;
}
