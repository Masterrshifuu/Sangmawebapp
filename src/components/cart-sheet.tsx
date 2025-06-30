'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ShoppingCart } from 'lucide-react';

export function CartSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-3/4 flex flex-col p-0 rounded-t-2xl" showCloseButton={false}>
        <div className="flex justify-center py-3">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        <SheetHeader className="p-4 pt-0 border-b">
          <SheetTitle className="text-center">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
            <ShoppingCart className="w-16 h-16 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
            <p className="text-sm">Add items from the store to see them here.</p>
        </div>
        <SheetFooter className="p-4 border-t bg-background mt-auto">
            <SheetClose asChild>
                <Button className="w-full">Continue Shopping</Button>
            </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
