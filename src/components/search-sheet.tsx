"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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
  const [initialRecommendations, setInitialRecommendations] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [searchSource, setSearchSource] = useState<"direct" | "ai" | null>(null);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  useEffect(() => {
    if (open && !hasFetchedInitial) {
      const fetchInitialRecommendations = async () => {
        setIsLoading(true);
        setSearchSource(null);
        try {
          const result = await itemRecommendation({ searchInput: "featured products" });
          const mappedProducts: Product[] = result.recommendedProducts.map(
            (p, index) => ({
              id: `${p.name}-${index}`,
              ...p,
              category: "Recommended",
              bestseller: false,
            })
          );
          setInitialRecommendations(mappedProducts);
          setRecommendations(mappedProducts);
          if (mappedProducts.length > 0) {
            setSearchSource("ai");
          }
        } catch (error) {
          console.error("Failed to fetch initial recommendations:", error);
        } finally {
          setIsLoading(false);
          setHasFetchedInitial(true);
        }
      };

      fetchInitialRecommendations();
    }
  }, [open, hasFetchedInitial]);

  useEffect(() => {
    if (!hasFetchedInitial) return;

    if (query.trim() === "") {
      setRecommendations(initialRecommendations);
      setSearchSource(initialRecommendations.length > 0 ? "ai" : null);
      return;
    }

    const debounceSearch = setTimeout(async () => {
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
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceSearch);
  }, [query, hasFetchedInitial, initialRecommendations]);


  const trigger =
    children ?? (
      <button>
        <Search className="w-5 h-5" />
        <span className="sr-only">Search</span>
      </button>
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
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
              />
               {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoading && recommendations.length === 0 && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && recommendations.length > 0 && (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recommendations.map((product) => (
                  <ProductCard key={product.id} product={product} size="small" />
                ))}
              </div>
            </div>
          )}
          
          {!isLoading && recommendations.length === 0 && (query || hasFetchedInitial) && (
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
