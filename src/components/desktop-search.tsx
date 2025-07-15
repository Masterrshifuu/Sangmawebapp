
"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Bot } from "lucide-react";
import ProductCard from "./product-card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useSearch } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

export default function DesktopSearch() {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results, isLoading, searchSource, hasFetchedInitial } = useSearch(open);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center w-full h-11 rounded-lg bg-muted px-4 text-left text-sm text-muted-foreground hover:bg-secondary/80 transition-colors",
            open && "ring-2 ring-ring"
          )}
        >
          <Search className="h-5 w-5 mr-3" />
          <span>Search for products...</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex w-full max-w-lg mx-auto items-center space-x-2 p-4 border-b">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="e.g., 'fresh vegetables' or 'milk'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-muted pl-10"
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="h-[60vh]">
          {isLoading && results.length === 0 && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold font-headline">
                  {query.trim() ? "Search Results" : "Featured Products"}
                </h3>
                {searchSource === "ai" && (
                  <Badge variant="secondary">
                    <Bot className="w-4 h-4 mr-2" />
                    AI-powered
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    size="small"
                    onProductClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {!isLoading && results.length === 0 && (query || hasFetchedInitial) && (
            <div className="text-center py-10 text-muted-foreground">
              <p>No products found for &quot;{query}&quot;.</p>
              <p className="text-sm">Try searching for something else.</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
