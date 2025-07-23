
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
import { useCart } from '@/hooks/use-cart';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import { CheckoutDialog } from './CheckoutDialog';
import { CartItemCard } from './cart/CartItemCard';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <>
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
          <SheetHeader className="p-4 pt-0 border-b">
            <SheetTitle className="text-center">Your Cart ({totalItems})</SheetTitle>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                Your cart is empty
              </h3>
              <p className="text-sm">
                Add items from the store to see them here.
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {cart.map((item) => (
                    <CartItemCard key={item.product.id} item={item} />
                  ))}
                </div>
              </ScrollArea>
              <SheetFooter className="p-4 border-t bg-background mt-auto">
                <div className="w-full space-y-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <SheetClose asChild>
                    <Button className="w-full" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                  </SheetClose>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
      <CheckoutDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  );
}
