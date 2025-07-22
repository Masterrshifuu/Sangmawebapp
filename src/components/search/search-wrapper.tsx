
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import DesktopSearch from "./desktop-search";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function SearchWrapper() {
  const isMobile = useIsMobile();
  const router = useRouter();

  if (isMobile === undefined) {
    // Return a placeholder or null to avoid SSR/CSR mismatch
    return <div className="h-11 w-full bg-background rounded-lg" />;
  }

  if (isMobile) {
    // On mobile, the search bar in the header is a button to switch to the search tab
    return (
      <button
        onClick={() => router.push('/?tab=search')}
        className={cn(
          'flex items-center w-full h-11 rounded-lg bg-background shadow-sm px-4 text-left text-sm text-muted-foreground active:bg-secondary/80'
        )}
      >
        <Search className="h-5 w-5 mr-3" />
        <span>Search for products...</span>
      </button>
    );
  }

  // On desktop, we always show the popover-based search
  return <DesktopSearch />;
}
