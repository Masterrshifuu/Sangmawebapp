
'use client';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/use-search';
import { SearchResults } from '@/components/search/search-results';
import Footer from '../footer';
import Header from '../header';

export default function SearchTab() {
  const { query, ...searchResultProps } = useSearch({ open: true }); // Always open in tab context
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background">
      <Header isScrolled={true} />
      <div className="p-4 border-b">
         <h1 className="text-3xl font-bold font-headline mb-4">Search</h1>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <SearchResults {...searchResultProps} query={query} onProductClick={() => {}} />
      </ScrollArea>
       <Footer />
    </div>
  );
}
