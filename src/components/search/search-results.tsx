
'use client';

import ProductCard from '@/components/product-card';
import { useSearch } from '@/hooks/use-search';
import Logo from '../logo';

type SearchResultsProps = {
  query: string;
  onProductClick: () => void;
};

export function SearchResults({
  query,
  onProductClick,
}: SearchResultsProps) {
  const { results, isLoading, hasFetchedInitial } = useSearch({ open: true });

  if (isLoading && results.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <Logo className="animate-logo-pulse" />
      </div>
    );
  }

  if (!query.trim() && results.length > 0) {
     return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold font-headline">
            Featured Products
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              size="small"
              onClick={onProductClick}
            />
          ))}
        </div>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold font-headline">
            {query.trim() ? 'Search Results' : 'Featured Products'}
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              size="small"
              onClick={onProductClick}
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
