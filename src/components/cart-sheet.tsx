
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { QuantitySelector } from '@/components/quantity-selector';
import type { CartItem } from '@/lib/types';
import { CheckoutSheet } from '@/components/checkout-sheet';
import { useState } from 'react';

function CartItemRow({ item }: { item: CartItem }) {
  const { addToCart, removeFromCart, clearItemFromCart } = useCart();
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
        <p className="font-bold text-sm">
          INR {(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => addToCart(item)}
          onDecrease={() => removeFromCart(item.id)}
          size="small"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => clearItemFromCart(item.id)}
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
      <ShoppingCart className="w-16 h-16 mb-4" />
      <h3 className="text-lg font-semibold text-foreground">
        Your cart is empty
      </h3>
      <p className="text-sm">Add items from the store to see them here.</p>
    </div>
  );
}

export function CartSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { cartItems, cartTotal, cartCount } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {cartCount > 0 && (
            <span className="absolute -top-1 right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">
              {cartCount}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[400px] flex flex-col p-0"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Your Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        {cartCount === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {cartItems.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="p-4 border-t bg-background shrink-0">
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
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
