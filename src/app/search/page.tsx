'use client';

import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearch } from '@/hooks/use-search';
import { SearchResults } from '@/components/search/search-results';
import AuthWrapper from '@/components/auth/auth-wrapper';
import Header from '@/components/header';
import Footer from '@/components/footer';
import BottomNavbar from '@/components/bottom-navbar';

function SearchPageContent() {
  const { query, setQuery, ...searchResultProps } = useSearch({ open: true });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
         <h1 className="text-3xl font-bold font-headline mb-4">Search</h1>
         <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
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
    </div>
  );
}


export default function SearchPage() {
    return (
        <AuthWrapper>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                    <div className="container mx-auto px-4 py-8">
                        <SearchPageContent />
                    </div>
                </main>
                <Footer />
                <div className="md:hidden">
                    <BottomNavbar />
                </div>
            </div>
        </AuthWrapper>
    )
}
