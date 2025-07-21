"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSearch from "./desktop-search";
import MobileSearch from "./mobile-search";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function SearchWrapper({ isBottomNav = false }: { isBottomNav?: boolean }) {
  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    // Return a placeholder or null to avoid SSR/CSR mismatch
    return <div className="h-11 w-full bg-background rounded-lg" />;
  }

  if (isMobile) {
    if (isBottomNav) {
      // On the bottom navbar, we want a simple trigger button
      return (
        <MobileSearch>
          <Button
            variant="ghost"
            className="p-0 h-auto text-current active:bg-transparent"
            aria-label="Search"
          >
            <Search className="h-7 w-7" />
            <span className="sr-only">Search</span>
          </Button>
        </MobileSearch>
      );
    }
    // In the header on mobile, we show the search bar trigger
    return (
      <MobileSearch>
        <button
          className={cn(
            'flex items-center w-full h-11 rounded-lg bg-background shadow-sm px-4 text-left text-sm text-muted-foreground active:bg-secondary/80'
          )}
        >
          <Search className="h-5 w-5 mr-3" />
          <span>Search for products...</span>
        </button>
      </MobileSearch>
    );
  }

  // On desktop, we always show the popover-based search
  return <DesktopSearch />;
}
