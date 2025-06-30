'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, ChevronDown, ShoppingCart, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchSheet from './search-sheet';
import { cn } from '@/lib/utils';
import Logo from './logo';
import Link from 'next/link';

export default function Header() {
  const [location, setLocation] = useState('Chandmari, South Tura');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for the form inside the dialog
  const [area, setArea] = useState('Chandmari');
  const [landmark, setLandmark] = useState('');
  const [turaRegion, setTuraRegion] = useState('South Tura');

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(savedLocation);
      const parts = savedLocation.split(', ');
      if (parts.length === 2) {
        setArea(parts[0]);
        setTuraRegion(parts[1]);
      }
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

  const handleSaveLocation = () => {
    const newLocation = `${area}, ${turaRegion}`;
    setLocation(newLocation);
    localStorage.setItem('userLocation', newLocation);
    setIsDialogOpen(false);
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
                <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <SheetTrigger asChild>
                    <button className="flex items-center mt-1 max-w-[250px] h-8 bg-transparent p-0">
                      <MapPin className="ml-0 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
                      <span className="bg-transparent border-none focus:ring-0 w-full text-sm text-muted-foreground truncate px-2 outline-none text-left">
                        {location}
                      </span>
                      <ChevronDown className="mr-2 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-auto flex flex-col p-0 rounded-t-2xl"
                  >
                    <div className="flex justify-center py-3">
                      <SheetClose>
                        <div className="w-12 h-1.5 rounded-full bg-muted" />
                      </SheetClose>
                    </div>
                    <SheetHeader className="p-4 pt-0 text-center">
                      <SheetTitle>Enter your location</SheetTitle>
                      <SheetDescription>
                        Provide your area and add landmark to get accurate
                        delivery times.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 p-4">
                      <div className="space-y-1">
                        <Label htmlFor="area">Area</Label>
                        <Input
                          id="area"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="e.g., Chandmari"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                          id="landmark"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Region</Label>
                        <Select value={turaRegion} onValueChange={setTuraRegion}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="North Tura">North Tura</SelectItem>
                            <SelectItem value="South Tura">South Tura</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <SheetFooter className="p-4 border-t bg-background mt-auto">
                      <Button
                        type="button"
                        onClick={handleSaveLocation}
                        className="w-full"
                      >
                        Save location
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </span>
                  <span className="sr-only">Shopping Cart</span>
                </Button>
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
