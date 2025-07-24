
'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { LocationPicker } from './location-picker';
import { SearchDialog } from './SearchDialog';
import { DesktopNav } from './DesktopNav';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Input } from './ui/input';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  // State for search functionality
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useOnClickOutside(searchRef, () => setIsSearchFocused(false));

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        setIsScrolled(currentScrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const showSearchResults = isDesktop && isSearchFocused;

  return (
    <header className="sticky top-0 z-50 border-b border-transparent">
      <div className="bg-[#faf368] backdrop-blur-sm relative">
        <div className="container mx-auto px-4">
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              isScrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
            )}
          >
            <div className="overflow-hidden">
              <div className="flex items-center gap-3 py-2">
                   <Image
                      src="/logo.png"
                      alt="Sangma Megha Mart Logo"
                      width={60}
                      height={60}
                      priority
                    />
                    <div className="flex flex-col justify-center pt-2">
                      <span className="font-headline text-base font-bold leading-none">
                          Sangma Megha Mart
                      </span>
                      <LocationPicker />
                    </div>
              </div>
            </div>
          </div>
          
          <div className="py-2" ref={searchRef}>
              <SearchDialog 
                query={query} 
                setQuery={setQuery} 
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
              >
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
                    onClick={() => setIsSearchFocused(false)}
                >
                    <SearchDialog.Content query={query} onProductClick={() => setIsSearchFocused(false)} />
                </div>
            </div>
          </div>
        )}

      </div>
      
      <div 
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isScrolled ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
          <div className="overflow-hidden bg-background/20 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <DesktopNav />
            </div>
          </div>
      </div>
    </header>
  );
}
