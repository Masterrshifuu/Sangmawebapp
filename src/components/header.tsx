
'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { SearchDialog } from './SearchDialog';
import { DesktopNav } from './DesktopNav';
import { Input } from './ui/input';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { useProducts } from '@/hooks/use-products';
import { useDebounce } from '@/hooks/use-debounce';
import type { Product } from '@/lib/types';
import Fuse from 'fuse.js';
import { ScrollArea } from './ui/scroll-area';
import { ProductCard } from './product-card';
import Link from 'next/link';
import { DynamicDeliveryTime } from './DynamicDeliveryTime';

const DesktopSearchResults = ({ query, onProductClick }: { query: string; onProductClick: () => void }) => {
    const { products: allProducts, loading: isLoading } = useProducts();
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const debouncedQuery = useDebounce(query, 300);

    const fuse = React.useMemo(() => new Fuse(allProducts, {
        keys: ['name', 'category', 'description', 'tags'],
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

    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    if (query.trim() !== '' && searchResults.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <p className="font-semibold">No results for "{query}"</p>
                <p className="text-sm">Try checking your spelling or using a different term.</p>
            </div>
        )
    }

    return (
        <ScrollArea className="max-h-[60vh]">
            {searchResults.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {searchResults.map(product => (
                        <div key={product.id} onClick={onProductClick}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>
    );
};


export default function Header() {
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(searchRef, () => setIsSearchFocused(false));

  const showSearchResults = isSearchFocused && query.trim().length > 1;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#faf368]">
        <div className={cn(
            "container mx-auto px-4 pt-3 transition-all duration-300 overflow-hidden",
            isScrolled ? 'h-0 py-0' : 'h-[68px]'
        )}>
            <div className="flex items-center gap-3">
                 <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="Sangma Megha Mart Logo"
                        width={60}
                        height={60}
                        priority
                    />
                    <div className="flex flex-col justify-center gap-1 flex-grow pt-1">
                        <span className="font-headline text-lg font-bold leading-none">
                            Sangma Megha Mart
                        </span>
                        <DynamicDeliveryTime className="text-muted-foreground" />
                    </div>
                </Link>
            </div>
        </div>
      <div className="bg-[#faf368] relative">
        <div className="container mx-auto px-4 py-3">
          {/* Search section */}
          <div ref={searchRef}>
              <SearchDialog>
                  {/* This child is the trigger for the mobile drawer */}
                  <button className="flex items-center w-full h-11 rounded-lg bg-background shadow-sm px-4 text-left text-sm text-muted-foreground hover:bg-background/80 transition-colors md:hidden">
                      <Search className="h-5 w-5 mr-3" />
                      <span>Search for products...</span>
                  </button>
              </SearchDialog>

              {/* Desktop-only direct input */}
              <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input
                    placeholder="Search for products..."
                    className="pl-10 h-11 text-base w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />
              </div>
          </div>
        </div>
        
        {/* Desktop search results popover */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 z-40">
             <div className="container mx-auto px-4">
                <div 
                    className="bg-background/80 backdrop-blur-sm rounded-b-lg shadow-2xl border-x border-b"
                >
                  <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                    <DesktopSearchResults query={query} onProductClick={() => setIsSearchFocused(false)} />
                  </Suspense>
                </div>
            </div>
          </div>
        )}
      </div>
        {/* Desktop Navigation */}
        <div className="hidden md:block bg-background/20 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <DesktopNav />
            </div>
        </div>
    </header>
  );
}
