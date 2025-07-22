"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSearch from "./desktop-search";
import MobileSearch from "./mobile-search";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function SearchWrapper({ isBottomNav = false }: { isBottomNav?: boolean }) {
  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    // Return a placeholder or null to avoid SSR/CSR mismatch
    return <div className="h-11 w-full bg-background rounded-lg" />;
  }

  if (isMobile) {
    // On mobile, the search bar in the header is a link to the search page
    return (
      <Link
        href="/search"
        className={cn(
          'flex items-center w-full h-11 rounded-lg bg-background shadow-sm px-4 text-left text-sm text-muted-foreground active:bg-secondary/80'
        )}
      >
        <Search className="h-5 w-5 mr-3" />
        <span>Search for products...</span>
      </Link>
    );
  }

  // On desktop, we always show the popover-based search
  return <DesktopSearch />;
}
