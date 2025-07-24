
'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/lib/types';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './product-card';
import Fuse from 'fuse.js';
import { useMediaQuery } from '@/hooks/use-media-query';

const RecommendedProducts = ({ products }: { products: Product[] }) => {
    // Show a few random products as "recommended"
    const recommended = useMemo(() => {
        return [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
    }, [products]);

    return (
        <div className="py-4">
            <h3 className="px-4 text-lg font-semibold mb-2">Recommended</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                {recommended.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

const SearchContent = ({ onProductClick }: { onProductClick?: () => void }) => {
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
        <>
             <DialogHeader className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                    placeholder="Search for products..."
                    className="pl-10 h-11 text-base"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </DialogHeader>
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading products...</div>
                ) : query.trim() === '' ? (
                    <RecommendedProducts products={allProducts} />
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
       </>
    )
}


export function SearchDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const handleProductClick = () => {
        setOpen(false);
    }

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="top-24 max-w-3xl translate-y-0 p-0 flex flex-col gap-0 data-[state=closed]:slide-out-to-top-[10%]">
                    <SearchContent onProductClick={handleProductClick} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent className="h-full flex flex-col p-0">
                 <SearchContent onProductClick={handleProductClick} />
            </DrawerContent>
        </Drawer>
    );
}

