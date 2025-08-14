
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { SearchDialog } from './SearchDialog';
import { DesktopNav } from './DesktopNav';
import Logo from './logo';
import { DynamicDeliveryTime } from './DynamicDeliveryTime';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';

const DesktopSearchResults = ({ query, onProductClick }: { query: string, onProductClick: () => void }) => {
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            const { products } = await getProducts();
            if (products) {
                const filteredProducts = products.filter((p: Product) => p.name.toLowerCase().includes(query.toLowerCase()));
                setResults(filteredProducts);
            }
            setLoading(false);
        };
        fetchResults();
    }, [query]);

    if (loading) {
        return <div className="p-4 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Searching...</div>;
    }
    
    if (results.length === 0 && query.length > 1) {
        return <div className="p-4 text-center text-muted-foreground">No results for &quot;{query}&quot;</div>;
    }

    if (results.length > 0) {
        return (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-h-[60vh] overflow-y-auto">
                {results.map(product => (
                    <div key={product.id} onClick={onProductClick}>
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        )
    }

    return null;
}


export function SearchHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(searchRef, () => setIsSearchFocused(false));

    const [isScrolled, setIsScrolled] = useState(false);
    const isHomePage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setIsSearchFocused(false);
        }
    };
    
    const showSearchResults = isSearchFocused && debouncedQuery.length > 1;
    
    return (
        <header className="sticky top-0 z-40">
             {isHomePage && (
                <div className={cn(
                    'bg-[#FCEE51] transition-all duration-300 ease-in-out', 
                    isScrolled ? 'max-h-0 opacity-0 invisible' : 'max-h-40 opacity-100 py-3'
                )}>
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-start">
                            <Logo />
                            <DynamicDeliveryTime className="text-sm justify-start pl-16 -mt-2" />
                        </div>
                    </div>
                </div>
            )}
             <div className="bg-[#FCEE51] border-y border-black/10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 py-2">
                        <div ref={searchRef} className="relative flex-1">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search for products..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        className="w-full pl-10 pr-10 py-2 rounded-md border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {query && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                            onClick={() => setQuery('')}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </form>
                            {showSearchResults && (
                                <div className="absolute top-full left-0 right-0 z-50">
                                    <div className="bg-background/95 backdrop-blur-sm rounded-b-lg shadow-2xl border-x border-b">
                                        <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                                            <DesktopSearchResults query={debouncedQuery} onProductClick={() => setIsSearchFocused(false)} />
                                        </Suspense>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden md:block">
                            <DesktopNav />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
