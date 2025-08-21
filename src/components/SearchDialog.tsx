"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const router = useRouter();

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value) {
      setResults([]);
      return;
    }
    // 🔍 replace this with your own search logic
    const fakeResults = [
      { id: 1, name: "Test Product A" },
      { id: 2, name: "Test Product B" },
    ].filter((item) => item.name.toLowerCase().includes(value.toLowerCase()));

    setResults(fakeResults);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex items-center gap-2 border-b pb-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search for products..."
            className="border-none focus:ring-0"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {query && results.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            <p className="font-semibold">
              No results for &quot;{query}&quot;
            </p>
            <p className="text-sm">
              Try checking your spelling or using a different term.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push(`/product/${item.id}`);
                  onOpenChange(false);
                }}
              >
                {item.name}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
