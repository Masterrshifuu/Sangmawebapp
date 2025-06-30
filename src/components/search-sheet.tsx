"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Bot } from "lucide-react";
import { itemRecommendation } from "@/ai/flows/item-recommendation";
import { searchProducts } from "@/lib/search";
import ProductCard from "./product-card";
import type { Product } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

export default function SearchSheet({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [searchSource, setSearchSource] = useState<"direct" | "ai" | null>(
    null
  );

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setRecommendations([]);
    setSearchSource(null);
    try {
      const directSearchResults = await searchProducts(query);

      if (directSearchResults.length > 0) {
        setRecommendations(directSearchResults);
        setSearchSource("direct");
      } else {
        const result = await itemRecommendation({ searchInput: query });
        const mappedProducts: Product[] = result.recommendedProducts.map(
          (p, index) => ({
            id: `${p.name}-${index}`,
            ...p,
            category: "Recommended",
            bestseller: false,
          })
        );
        setRecommendations(mappedProducts);
        if (mappedProducts.length > 0) {
          setSearchSource("ai");
        }
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const trigger =
    children ?? (
      <Button variant="ghost" size="icon">
        <Search className="w-5 h-5" />
        <span className="sr-only">Search</span>
      </Button>
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[86vh] flex flex-col p-0 rounded-t-2xl"
        showCloseButton={false}
      >
        <div className="flex justify-center py-3">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        <div className="px-4 pb-4 border-b">
          <SheetHeader className="text-center mb-4">
            <SheetTitle className="font-headline text-xl">
              Search for Products
            </SheetTitle>
            <SheetDescription>
              Use our AI assistant to find what you need.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-lg mx-auto items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="e.g., 'fresh vegetables' or 'milk'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </form>
        </div>

        <ScrollArea className="flex-1">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && recommendations.length > 0 && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold font-headline">
                  {searchSource === "direct"
                    ? "Search Results"
                    : "Recommended Products"}
                </h3>
                {searchSource === "ai" && (
                  <Badge variant="secondary">
                    <Bot className="w-4 h-4 mr-2" />
                    AI-powered
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recommendations.map((product) => (
                  <ProductCard key={product.id} product={product} size="small" />
                ))}
              </div>
            </div>
          )}

          {!isLoading && recommendations.length === 0 && query && (
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
