"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "./search-results";
import { ScrollArea } from "../ui/scroll-area";

export default function DesktopSearch() {
  const [open, setOpen] = useState(false);
  const { query, setQuery, ...searchResultProps } = useSearch({ open, isDesktop: true });
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onFocus={() => {
              if (!open) setOpen(true);
            }}
            className="bg-background pl-10 shadow-sm"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ScrollArea className="h-[60vh]">
          <SearchResults {...searchResultProps} query={query} onProductClick={() => setOpen(false)} />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
