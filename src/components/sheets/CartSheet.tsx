

'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';

import { ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo, useState, useRef, RefObject } from 'react';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { useLocation } from '@/hooks/use-location';
import { calculateDeliveryCharge } from '@/lib/delivery';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronUp, ChevronDown } from 'lucide-react';

const FreeDeliveryProgress = ({ totalPrice, region }: { totalPrice: number, region: 'North Tura' | 'South Tura' | 'Tura NEHU' | null }) => {
    const freeDeliveryThreshold = region === 'Tura NEHU' ? 3000 : 1000;
    const amountNeeded = freeDeliveryThreshold - totalPrice;

    if (amountNeeded > 0 && amountNeeded < 500) { // Only show if they are close
        return (
            <div className="p-2 my-2 text-center text-xs bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg">
                <p>
                    <Sparkles className="inline-block w-3 h-3 mr-1" />
                    Add ₹{amountNeeded.toFixed(2)} more for FREE delivery!
                </p>
            </div>
        )
    }
    return null;
}


const CartContent = ({ onCheckout, scrollContainerRef }: { onCheckout: () => void; scrollContainerRef?: RefObject<HTMLDivElement> }) => {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { address } = useLocation();

  const deliveryCharge = useMemo(() => {
    return calculateDeliveryCharge(totalPrice, address);
  }, [totalPrice, address]);

  const finalTotal = totalPrice + deliveryCharge;
  
  const cartItemsList = (
    <div ref={scrollContainerRef} className="p-4 space-y-4">
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
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1">
          {cartItemsList}
      </ScrollArea>
      <SheetFooter className="p-4 border-t bg-background mt-auto">
        <div className="w-full space-y-2">
            <FreeDeliveryProgress totalPrice={totalPrice} region={address?.region || null} />
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
            </span>
          </div>
          
          <Separator className="my-2" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'up' | 'down') => {
    const { current } = scrollContainerRef;
    if (current) {
      const scrollAmount = direction === 'up' ? -150 : 150;
      current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleProceedToCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  if (isDesktop) {
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>{children}</PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Your Cart ({totalItems})</h3>
            </div>
            <ScrollArea className="max-h-[400px]">
                <CartContent onCheckout={handleProceedToCheckout} scrollContainerRef={scrollContainerRef} />
            </ScrollArea>
             {totalItems > 3 && (
                <div className="p-2 border-t flex justify-end gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleScroll('up')}>
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                     <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleScroll('down')}>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </PopoverContent>
        </Popover>
      );
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
