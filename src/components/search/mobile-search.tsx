"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "./search-results";

export default function MobileSearch({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { query, setQuery, ...searchResultProps } = useSearch({ open });

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
                className="bg-background pl-10 shadow-sm"
                autoFocus
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <SearchResults {...searchResultProps} query={query} onProductClick={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
