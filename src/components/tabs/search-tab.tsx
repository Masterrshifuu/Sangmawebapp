
'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/use-search';
import { SearchResults } from '@/components/search/search-results';
import Footer from '../footer';
import Header from '../header';

export default function SearchTab() {
  const { query, ...searchResultProps } = useSearch({ open: true }); // Always open in tab context

  return (
    <div className="flex flex-col h-full bg-background">
      <Header isScrolled={true} />
      <ScrollArea className="flex-1 min-h-0">
        <SearchResults {...searchResultProps} query={query} onProductClick={() => {}} />
      </ScrollArea>
       <Footer />
    </div>
  );
}
