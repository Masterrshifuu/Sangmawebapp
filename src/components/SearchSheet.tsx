
'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/lib/types';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './product-card';
import Fuse from 'fuse.js';

const RecommendedProducts = ({ products }: { products: Product[] }) => {
    // Show a few random products as "recommended"
    const recommended = useMemo(() => {
        return [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [products]);

    return (
        <div className="py-4">
            <h3 className="px-4 text-lg font-semibold mb-2">Recommended</h3>
            <div className="grid grid-cols-2 gap-4 px-4">
                {recommended.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export function SearchSheet({ children }: { children: React.ReactNode }) {
    const { products: allProducts, loading: isLoading } = useProducts();
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [query, setQuery] = useState('');

    const fuse = useMemo(() => new Fuse(allProducts, {
        keys: ['name', 'category', 'description'],
        threshold: 0.3,
    }), [allProducts]);

    useEffect(() => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = fuse.search(query);
        setSearchResults(results.map(result => result.item));
    }, [query, fuse]);

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-full flex flex-col p-0">
        <DrawerHeader className="p-4 border-b">
          <DrawerTitle className="sr-only">Search Products</DrawerTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              className="pl-10 h-11 text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </DrawerHeader>
        <ScrollArea className="flex-1">
            {isLoading ? (
                 <div className="p-4 text-center text-muted-foreground">Loading products...</div>
            ) : query.trim() === '' ? (
                <RecommendedProducts products={allProducts} />
            ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 p-4">
                    {searchResults.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-muted-foreground">
                    <p className="font-semibold">No results for "{query}"</p>
                    <p className="text-sm">Try checking your spelling or using a different term.</p>
                </div>
            )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
