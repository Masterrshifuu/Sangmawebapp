
'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LocationPicker } from './location-picker';
import { SearchSheet } from './SearchSheet';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 bg-[#fdffbd] border-b">
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
        
        <div className="py-3">
            <SearchSheet>
                <button className="flex items-center w-full h-11 rounded-lg bg-background shadow-sm px-4 text-left text-sm text-muted-foreground hover:bg-background/80 transition-colors">
                    <Search className="h-5 w-5 mr-3" />
                    <span>Search for products...</span>
                </button>
            </SearchSheet>
        </div>
      </div>
    </header>
  );
}
