

'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo, useState } from 'react';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { useLocation } from '@/hooks/use-location';
import { calculateDeliveryCharge } from '@/lib/delivery';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';

const CartContent = ({ onCheckout }: { onCheckout: () => void }) => {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { address } = useLocation();

  const deliveryCharge = useMemo(() => {
    if (cart.length === 0) return 0;
    return calculateDeliveryCharge(totalPrice, address);
  }, [totalPrice, address, cart.length]);

  const isServiceable = deliveryCharge !== null;
  const finalTotal = isServiceable ? totalPrice + (deliveryCharge ?? 0) : totalPrice;
  
  const cartItemsList = (
    <div className="p-4 space-y-4">
      {cart.map((item) => (
        <CartItemCard key={item.product.id} item={item} />
      ))}
    </div>
  );

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground h-full">
        <ShoppingCart className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">
          Your cart is empty
        </h3>
        <p className="text-sm">
          Add items from the store to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
          {cartItemsList}
      </ScrollArea>
      <SheetFooter className="p-4 border-t bg-background mt-auto">
        <div className="w-full space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            {isServiceable ? (
              <span>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
              </span>
            ) : (
              <span className="text-destructive font-medium">Select Address</span>
            )}
          </div>
          
          <Separator className="my-2" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

          {!isServiceable && (
            <p className="text-xs text-destructive text-center p-2 bg-destructive/10 rounded-md">
              Please provide a delivery address at checkout.
            </p>
          )}

          <Button 
              className="w-full" 
              size="lg"
              onClick={onCheckout}
          >
              Proceed to Checkout
          </Button>
          
          <Button variant="outline" className="w-full" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </SheetFooter>
    </div>
  )
}

export function CartSheet({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { totalItems } = useCart();

  const handleProceedToCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="right" size="sm" className="p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Your Cart ({totalItems})</SheetTitle>
          </SheetHeader>
          <CartContent onCheckout={handleProceedToCheckout} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-[85vh] flex flex-col p-0"
      >
        <DrawerHeader className="p-4 pt-4 border-b flex items-center justify-between">
          <DrawerTitle className="flex-1 text-center">Your Cart ({totalItems})</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <CartContent onCheckout={handleProceedToCheckout} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
