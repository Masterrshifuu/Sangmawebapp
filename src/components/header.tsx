
'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { SearchSheet } from './SearchSheet';
import { cn } from '@/lib/utils';
import { LocationPicker } from './location-picker';
import Logo from './logo';

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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isScrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex justify-between items-center py-2">
                <Logo />
                <LocationPicker />
            </div>
          </div>
        </div>
        
        <div className="py-3">
          <SearchSheet>
              <button className="flex items-center w-full h-11 rounded-lg bg-muted/60 px-4 text-left text-sm text-muted-foreground hover:bg-muted/100 transition-colors">
                  <Search className="h-5 w-5 mr-3" />
                  <span>Search for products...</span>
              </button>
          </SearchSheet>
        </div>
      </div>
    </header>
  );
}
