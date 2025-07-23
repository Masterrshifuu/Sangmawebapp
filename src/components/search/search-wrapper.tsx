
"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchContext } from "@/context/search-context";
import { Input } from "../ui/input";

export function SearchWrapper() {
  const router = useRouter();
  const { query, setQuery } = useSearchContext();

  const handleFocus = () => {
    router.push('/?tab=search');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // When typing, ensure we are on the search tab
    if (window.location.search.indexOf('tab=search') === -1) {
       router.push('/?tab=search');
    }
    setQuery(e.target.value);
  }

  return (
    <div className="relative w-full">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
        <Input
            type="text"
            placeholder="Search for products..."
            className="bg-background pl-10 shadow-sm"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
        />
    </div>
  );
}
