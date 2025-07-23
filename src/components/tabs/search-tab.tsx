
'use client';
import { useSearch } from '@/hooks/use-search';
import { SearchResults } from '@/components/search/search-results';
import Footer from '../footer';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { useSearchContext } from '@/context/search-context';
import { useRef } from 'react';

interface SearchTabProps {
}

export default function SearchTab({ }: SearchTabProps) {
  const { query, setQuery } = useSearchContext();
  const { results, isLoading, hasFetchedInitial } = useSearch({ open: true });
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-background z-10">
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
      <div className="flex-1">
        <SearchResults results={results} isLoading={isLoading} hasFetchedInitial={hasFetchedInitial} query={query} onProductClick={() => {}} />
      </div>
       <Footer />
    </div>
  );
}
