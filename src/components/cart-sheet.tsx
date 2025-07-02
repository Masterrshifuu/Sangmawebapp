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
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { QuantitySelector } from './quantity-selector';
import type { CartItem } from '@/lib/types';
import { CheckoutSheet } from './checkout-sheet';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cartItems, clearCart, cartTotal, cartCount } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-3/4 flex flex-col p-0 rounded-t-2xl"
        showCloseButton={false}
      >
        <div className="flex justify-center py-3">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        <SheetHeader className="p-4 pt-0 border-b flex flex-row justify-between items-center">
          <SheetTitle className="text-center flex-1">Your Cart ({cartCount})</SheetTitle>
          {cartCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearCart}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear Cart</span>
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 flex flex-col">
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

        <SheetFooter className="p-4 border-t bg-background mt-auto">
          {cartCount > 0 ? (
            <div className="w-full space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <CheckoutSheet>
                <SheetClose asChild>
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </SheetClose>
              </CheckoutSheet>
            </div>
          ) : (
            <SheetClose asChild>
              <Button className="w-full">Continue Shopping</Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
        className="rounded-md object-cover h-16 w-16 border"
        data-ai-hint="product image"
      />
      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="font-semibold line-clamp-1 truncate">{item.name}</p>
        <p className="text-muted-foreground">₹{item.price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => addToCart(item)}
          onDecrease={() => removeFromCart(item.id)}
          size="small"
        />
        <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
}
