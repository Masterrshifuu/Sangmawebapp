
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
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { useLocation } from '@/hooks/use-location';
import { calculateDeliveryCharge } from '@/lib/delivery';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { location } = useLocation();

  const deliveryCharge = useMemo(() => {
    if (cart.length === 0) return 0;
    return calculateDeliveryCharge(totalPrice, location);
  }, [totalPrice, location, cart.length]);

  const isServiceable = deliveryCharge !== null;
  const finalTotal = isServiceable ? totalPrice + (deliveryCharge ?? 0) : totalPrice;

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent
          className="h-full md:h-[80vh] flex flex-col p-0"
        >
          <DrawerHeader className="p-4 pt-4 border-b flex items-center justify-between">
            <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="md:flex hidden">
                    <ChevronLeft />
                    <span className="sr-only">Back</span>
                </Button>
            </DrawerClose>
            <DrawerTitle className="flex-1 text-center">Your Cart ({totalItems})</DrawerTitle>
            <div className="w-10 md:block hidden" />
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
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>INR {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    {isServiceable ? (
                      <span>
                        {deliveryCharge === 0 ? 'FREE' : `INR ${deliveryCharge.toFixed(2)}`}
                      </span>
                    ) : (
                      <span className="text-destructive font-medium">Unserviceable</span>
                    )}
                  </div>
                  
                  <Separator className="my-2" />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>INR {finalTotal.toFixed(2)}</span>
                  </div>

                  {!isServiceable && (
                    <p className="text-xs text-destructive text-center p-2 bg-destructive/10 rounded-md">
                      Sorry, we do not deliver to your selected location. Please change your address to proceed.
                    </p>
                  )}

                  <DrawerClose asChild>
                    <Link href="/checkout" passHref>
                        <Button 
                            className="w-full" 
                            disabled={!isServiceable}
                            aria-disabled={!isServiceable}
                        >
                            Proceed to Checkout
                        </Button>
                    </Link>
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
    </>
  );
}
