"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { itemRecommendation } from "@/ai/flows/item-recommendation";
import ProductCard from "./product-card";
import type { Product } from "@/lib/data";
import { ScrollArea } from "./ui/scroll-area";

export default function SearchSheet({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [query, setQuery] = useState("");

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setRecommendations([]);
    try {
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
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      // Here you could show a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const trigger = children ?? (
    <Button variant="ghost" size="icon">
      <Search className="w-5 h-5" />
      <span className="sr-only">Search</span>
    </Button>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="top" className="h-full md:h-auto md:max-h-[80vh]">
        <SheetHeader className="text-center mb-6">
          <SheetTitle className="font-headline text-2xl">Search for Products</SheetTitle>
          <SheetDescription>
            Use our AI assistant to find what you need.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSearch} className="flex w-full max-w-lg mx-auto items-center space-x-2 mb-8">
          <Input 
            type="text" 
            placeholder="e.g., 'fresh vegetables' or 'milk'" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </form>
        
        <ScrollArea className="h-[calc(100%-160px)] md:h-auto">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && recommendations.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
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
