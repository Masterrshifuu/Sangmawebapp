
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { QuantitySelector } from './quantity-selector';
import type { CartItem } from '@/lib/types';
import { CheckoutSheet } from './checkout-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { cn } from '@/lib/utils';

function CartContent() {
  const { cartItems, clearCart, cartTotal, cartCount } = useCart();

  return (
    <>
      <div className={cn("p-4 border-b flex flex-row justify-between items-center text-center sm:text-left")}>
        <h2 className="text-lg font-semibold text-foreground">Your Cart ({cartCount})</h2>
        {cartCount > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearCart}
            className="text-muted-foreground hover:text-destructive h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear Cart</span>
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {cartCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
            <ShoppingCart className="w-16 h-16 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
            <p className="text-sm">Add items from the store to see them here.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="p-4 border-t bg-background mt-auto">
        {cartCount > 0 ? (
          <div className="w-full space-y-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>INR {cartTotal.toFixed(2)}</span>
            </div>
            <CheckoutSheet>
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
            </CheckoutSheet>
          </div>
        ) : (
            <DrawerClose asChild>
              <Button className="w-full" variant="outline">Continue Shopping</Button>
            </DrawerClose>
        )}
      </div>
    </>
  );
}


function CartItemRow({ item }: { item: CartItem }) {
  const { addToCart, removeFromCart } = useCart();
  return (
    <div className="flex items-center gap-4 p-4">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={64}
        height={64}
        className="rounded-md object-contain h-16 w-16 border"
        data-ai-hint="product image"
      />
      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="font-semibold line-clamp-1 truncate">{item.name}</p>
        <p className="text-muted-foreground">INR {item.price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => addToCart(item)}
          onDecrease={() => removeFromCart(item.id)}
          size="small"
        />
        <p className="font-bold">INR {(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
}

export function Cart({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    return null; // or a placeholder
  }

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="h-[75vh] flex flex-col p-0">
          <CartContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0 flex flex-col" align="end">
         <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
         </div>
         <div className="max-h-[60vh] flex flex-col">
            <CartContent />
         </div>
      </PopoverContent>
    </Popover>
  );
}
