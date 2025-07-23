
'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useSearch } from '@/hooks/use-search';
import { SearchResults } from '@/components/search/search-results';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { useSearchContext } from '@/context/search-context';

export default function SearchSheet() {
  const { query, setQuery, open, setOpen } = useSearchContext();
  const { results, isLoading, hasFetchedInitial } = useSearch({ open });

  const handleProductClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Search for Products</SheetTitle>
          <div className="relative w-full max-w-lg mx-auto pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search for anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-muted pl-10 shadow-sm"
              autoFocus
            />
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <SearchResults
            results={results}
            isLoading={isLoading}
            hasFetchedInitial={hasFetchedInitial}
            query={query}
            onProductClick={handleProductClick}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
