"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import SearchSheet from "./search-sheet";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm transition-all duration-300",
        isScrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/">
          <Logo className="text-primary-foreground" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" className="hidden sm:flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Shillong, Meghalaya</span>
          </Button>

          <SearchSheet />

          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              3
            </span>
            <span className="sr-only">Shopping Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
