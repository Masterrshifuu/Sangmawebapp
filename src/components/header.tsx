'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchSheet from './search-sheet';
import LocationSheet from './location-sheet';
import { cn } from '@/lib/utils';
import Logo from './logo';
import Link from 'next/link';
import CartSheet from './cart-sheet';

export default function Header() {
  const [location, setLocation] = useState('Chandmari, South Tura');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSaveLocation = (newLocation: string) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', newLocation);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary/80 backdrop-blur-sm border-b text-primary-foreground transition-all duration-300">
      <div className="container mx-auto px-4 py-3">
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            isScrolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
          )}
        >
          <div className="overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Link href="/">
                  <Logo />
                </Link>
                <LocationSheet location={location} onSave={handleSaveLocation} />
              </div>

              <div className="flex items-center gap-2">
                <CartSheet />
              </div>
            </div>
          </div>
        </div>

        <div>
          <SearchSheet>
            <button className="flex items-center w-full h-11 rounded-lg bg-muted px-4 text-left text-sm text-muted-foreground hover:bg-secondary/80 transition-colors">
              <Search className="h-5 w-5 mr-3" />
              <span>Search for products...</span>
            </button>
          </SearchSheet>
        </div>
      </div>
    </header>
  );
}
