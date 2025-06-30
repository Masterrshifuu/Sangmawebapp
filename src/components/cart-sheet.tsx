"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function CartSheet() {
  // In a real app, you'd get this from a state management solution
  const itemCount = 3; 

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {itemCount}
            </span>
          )}
          <span className="sr-only">Shopping Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            You have {itemCount} item(s) in your cart.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 text-center text-muted-foreground">
          <p>Your cart is currently empty.</p>
          <p className="text-sm">Add items to see them here.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
