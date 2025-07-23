
'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
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
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent
          className="h-3/4 flex flex-col p-0 rounded-t-2xl"
        >
          <DrawerHeader className="p-4 pt-0 border-b">
            <DrawerTitle className="text-center">Your Cart ({totalItems})</DrawerTitle>
          </DrawerHeader>

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
              <DrawerFooter className="p-4 border-t bg-background mt-auto">
                <div className="w-full space-y-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <DrawerClose asChild>
                    <Button className="w-full" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                  </DrawerClose>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <CheckoutDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  );
}
