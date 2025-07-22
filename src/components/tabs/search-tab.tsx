'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/use-search';
import { SearchResults } from '@/components/search/search-results';

export default function SearchTab() {
  const { query, setQuery, ...searchResultProps } = useSearch({ open: true }); // Always open in tab context
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
         <h1 className="text-3xl font-bold font-headline mb-4">Search</h1>
         <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-muted pl-10 shadow-sm"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
            />
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <SearchResults {...searchResultProps} query={query} onProductClick={() => {}} />
      </ScrollArea>
    </div>
  );
}
