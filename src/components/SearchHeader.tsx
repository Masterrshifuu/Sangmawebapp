
'use client';

import * as React from 'react';
import { MapPin, Search } from 'lucide-react';
import { useState, useRef, Suspense } from 'react';
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
import Logo from './logo';
import { DynamicDeliveryTime } from './DynamicDeliveryTime';
import { useLocation } from '@/hooks/use-location';

const DesktopSearchResults = ({ query, onProductClick }: { query: string; onProductClick: () => void }) => {
    const { products: allProducts, loading: isLoading } = useProducts();
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const debouncedQuery = useDebounce(query, 300);

    const fuse = React.useMemo(() => new Fuse(allProducts, {
        keys: ['name', 'category', 'description', 'tags'],
        threshold: 0.3,
        minMatchCharLength: 2,
    }), [allProducts]);

    React.useEffect(() => {
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


export default function SearchHeader() {
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { address } = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  

  useOnClickOutside(searchRef, () => setIsSearchFocused(false));

  const showSearchResults = isSearchFocused && query.trim().length > 1;

  return (
 <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background shadow-sm' : ''}`}>
 <div className="container mx-auto">
       <div className="bg-background border-b">
 <div className="px-4 py-2 flex justify-between items-center">
 <Logo />
 <div className="text-right">
 <div className="flex items-center justify-end gap-1 text-sm font-medium">
 <MapPin className="w-4 h-4" />
 <span>Deliver to: {address ? `${address.area}, ${address.region}` : 'Tura'}</span>
 </div>
 <DynamicDeliveryTime className="text-xs" />
 </div>
 </div>
       </div>
      <div className="bg-[#faf368] relative">
 <div className="px-4 py-3">
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
 <div className="px-4">
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
      <div className="hidden md:block bg-background/80 backdrop-blur-sm border-b">
            <div className="container mx-auto px-4">
                <DesktopNav />
            </div>
        </div>
        </div>
    </header>
  );
}
