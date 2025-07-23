
'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/use-search';
import { SearchResults } from '@/components/search/search-results';
import Footer from '../footer';
import Header from '../header';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export default function SearchTab() {
  const { query, setQuery, ...searchResultProps } = useSearch({ open: true }); // Always open in tab context

  return (
    <div className="flex flex-col h-full bg-background">
      <Header isScrolled={true} />
      <div className="p-4 border-b">
        <div className="relative w-full max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-muted pl-10 shadow-sm"
            autoFocus
          />
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <SearchResults {...searchResultProps} query={query} onProductClick={() => {}} />
      </ScrollArea>
       <Footer />
    </div>
  );
}
