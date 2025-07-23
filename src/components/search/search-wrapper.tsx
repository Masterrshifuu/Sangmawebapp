
"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchContext } from "@/context/search-context";

export function SearchWrapper() {
  const { setOpen } = useSearchContext();

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <div
      className="relative w-full cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
      <div className={cn(
          "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 pl-10 text-base text-muted-foreground ring-offset-background shadow-sm",
          "md:text-sm"
      )}>
        Search for products...
      </div>
    </div>
  );
}
