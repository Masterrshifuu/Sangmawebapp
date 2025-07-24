
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
import type { Product } from '@/lib/types';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './product-card';
import Fuse from 'fuse.js';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useDebounce } from '@/hooks/use-debounce';

const RecommendedProducts = ({ products, onProductClick }: { products: Product[], onProductClick?: () => void }) => {
    // Show a few random products as "recommended"
    const recommended = useMemo(() => {
        return [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [products]);

    return (
        <div className="py-4">
            <h3 className="px-4 text-lg font-semibold mb-2">Recommended</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                {recommended.map(product => (
                    <div key={product.id} onClick={onProductClick}>
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    )
}

const SearchContent = ({ query, onProductClick }: { query: string, onProductClick?: () => void }) => {
    const { products: allProducts, loading: isLoading } = useProducts();
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const debouncedQuery = useDebounce(query, 300);

    const fuse = useMemo(() => new Fuse(allProducts, {
        keys: ['name', 'category', 'description'],
        threshold: 0.3,
        minMatchCharLength: 2,
    }), [allProducts]);

    useEffect(() => {
        if (debouncedQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = fuse.search(debouncedQuery);
        setSearchResults(results.map(result => result.item));
    }, [debouncedQuery, fuse]);

    return (
        <ScrollArea className="flex-1 max-h-[60vh]">
            {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading products...</div>
            ) : query.trim() === '' ? (
                <RecommendedProducts products={allProducts} onProductClick={onProductClick} />
            ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {searchResults.map(product => (
                        <div key={product.id} onClick={onProductClick}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-muted-foreground">
                    <p className="font-semibold">No results for "{query}"</p>
                    <p className="text-sm">Try checking your spelling or using a different term.</p>
                </div>
            )}
        </ScrollArea>
    )
}

interface SearchDialogProps {
    children: React.ReactNode;
    query: string;
    setQuery: (query: string) => void;
    isSearchFocused: boolean;
    setIsSearchFocused: (isFocused: boolean) => void;
}

export function SearchDialog({ children, query, setQuery, isSearchFocused, setIsSearchFocused }: SearchDialogProps) {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const handleProductClick = () => {
        setOpen(false);
        setIsSearchFocused(false);
    }
    
    // This is the mobile view, which uses the Drawer
    if (!isDesktop) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
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
                                autoFocus
                            />
                        </div>
                    </DrawerHeader>
                    <SearchContent query={query} onProductClick={handleProductClick} />
                </DrawerContent>
            </Drawer>
        );
    }

    // On desktop, this component doesn't render a dialog itself.
    // The parent `Header` component handles the popover logic.
    // It only returns the trigger for the mobile drawer.
    return <>{children}</>;
}

SearchDialog.Content = SearchContent;
