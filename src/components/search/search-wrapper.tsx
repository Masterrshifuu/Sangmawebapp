"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSearch from "./desktop-search";
import MobileSearch from "./mobile-search";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { AnimatedPlaceholder } from "./animated-placeholder";

export function SearchWrapper({ isBottomNav = false }: { isBottomNav?: boolean }) {
  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    // Return a placeholder or null to avoid SSR/CSR mismatch
    return null;
  }

  if (isMobile) {
    if (isBottomNav) {
      // On the bottom navbar, we want a simple trigger button
      return (
        <MobileSearch>
          <Button
            variant="ghost"
            className="p-0 h-auto text-current active:bg-transparent"
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
        <AnimatedPlaceholder />
      </MobileSearch>
    );
  }

  // On desktop, we always show the popover-based search
  return <DesktopSearch />;
}
