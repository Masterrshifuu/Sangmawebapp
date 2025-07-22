'use client';

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/use-search';
import { SearchResults } from './search-results';

export default function MobileSearch({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { query, setQuery, ...searchResultProps } = useSearch({ open, isDesktop: false });

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-card flex flex-col max-h-[85vh]">
        <DrawerTitle className="sr-only">Search Products</DrawerTitle>
        <div className="p-4 border-b">
          <div className="flex w-full max-w-lg mx-auto items-center space-x-2 pt-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-background pl-10 shadow-sm"
                autoFocus
              />
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <SearchResults
            {...searchResultProps}
            query={query}
            onProductClick={() => setOpen(false)}
          />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
