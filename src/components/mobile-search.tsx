
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Bot } from "lucide-react";
import ProductCard from "./product-card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useSearch } from "@/hooks/use-search";

export default function MobileSearch({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results, isLoading, searchSource, hasFetchedInitial } = useSearch(open);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[86vh] flex flex-col p-0 rounded-t-2xl bg-card"
        showCloseButton={false}
      >
        <div className="flex justify-center py-3">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        <div className="px-4 pb-4 border-b">
          <div
            className="flex w-full max-w-lg mx-auto items-center space-x-2 pt-4"
          >
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
        </div>

        <ScrollArea className="flex-1">
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
      </SheetContent>
    </Sheet>
  );
}
