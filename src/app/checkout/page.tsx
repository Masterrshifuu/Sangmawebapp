
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { calculateDeliveryCharge } from '@/lib/delivery';
import type { Order, Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronLeft, X, CheckCircle2, ShoppingBag } from 'lucide-react';
import { getNextOrderId, incrementUserStat, saveOrUpdateUserAddress } from '@/lib/user';
import { CheckoutPageSkeleton } from '@/components/pages/checkout/CheckoutPageSkeleton';
import { OrderSummary } from '@/components/pages/checkout/OrderSummary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DeliveryAddressForm } from '@/components/pages/checkout/DeliveryAddressForm';
import { getStoreStatus } from '@/lib/datetime';
import { StoreClosedWarning } from '@/components/pages/checkout/StoreClosedWarning';


export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  
  const [address, setAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi_on_delivery'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ title: string; message: string; } | null>(null);
  const [scheduleForNextDay, setScheduleForNextDay] = useState(true);
  const [successfulOrder, setSuccessfulOrder] = useState<string | null>(null);
  
  useEffect(() => {
    setIsClient(true);
    // Scroll to the top of the page when the component mounts
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  
  const storeStatus = getStoreStatus();
  const MINIMUM_ORDER_VALUE = 150;
  
  useEffect(() => {
    // Only redirect if cart is empty after initial load sequence
    if (isClient && !authLoading && (cart.length === 0 || totalPrice < MINIMUM_ORDER_VALUE)) {
        router.replace('/');
    }
  }, [isClient, cart.length, totalPrice, authLoading, router]);

  const deliveryCharge = useMemo(() => {
      // Ensure we have an address to calculate charge, otherwise it's a default fee.
      // This is mainly for UI display before an address is entered.
      if (!address?.region) {
 return null; // Return null when address region is not available
      }
      return calculateDeliveryCharge(totalPrice, address);
  }, [totalPrice, address]);
  const finalTotal = useMemo(() => totalPrice + (deliveryCharge ?? 0), [totalPrice, deliveryCharge]);

  const placeOrder = async (paymentDetails: { method: 'cod' | 'upi_on_delivery' }) => {
    if (deliveryCharge === null || !address || !address.phone || !address.name) {
      setErrorDetails({
        title: 'Invalid Address',
        message: 'Please provide a valid delivery address including your name and phone number.'
      });
      return;
    }
    
    if (totalPrice < MINIMUM_ORDER_VALUE) {
        setErrorDetails({
            title: 'Minimum Order Value',
            message: `The minimum order value is ₹${MINIMUM_ORDER_VALUE}.`
        });
        return;
    }

    setIsPlacingOrder(true);
    const deliveryAddressString = `${address.area}${address.landmark ? ', ' + address.landmark : ''}, ${address.region}`;

    try {
        const orderStatus = storeStatus.isOpen ? 'Pending' : 'Scheduled';

        // Get the next custom order ID
        const customOrderId = await getNextOrderId();

        const orderData: Omit<Order, 'id' | 'cancelledAt'> = {
          userId: user?.uid || 'guest',
          userName: address.name || user?.displayName || 'Guest Customer',
          userEmail: user?.email || 'guest@sangmamart.com',
          userPhone: address.phone,
          createdAt: serverTimestamp(),
          deliveryAddress: deliveryAddressString,
          items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.mrp || item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl
          })),
          paymentMethod: paymentDetails.method,
          status: orderStatus,
          subtotal: totalPrice,
          deliveryCharge: deliveryCharge,
          totalAmount: finalTotal,
          active: true,
          viewedByCustomer: false, // New field for notification tracking
          extraTimeInMinutes: 0,
          extraReasons: []
        };
        
        // Use the custom order ID to create the document reference
        const newOrderRef = doc(db, 'orders', customOrderId);
        await setDoc(newOrderRef, orderData);

        // Only save address and increment stats if user is logged in
        if (user) {
            await saveOrUpdateUserAddress(user.uid, address);
            await incrementUserStat(user.uid, 'totalOrders');
        }

        clearCart();
        setSuccessfulOrder(newOrderRef.id);
        
    } catch (error: any) {
      console.error("Error placing order: ", error);
      setErrorDetails({
          title: "Order Placement Failed",
          message: `An error occurred while communicating with the server. Please check the details and try again. Error: ${error.message}`
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  const proceedToPlaceOrder = async () => {
    setErrorDetails(null);
    if (!storeStatus.isOpen && !scheduleForNextDay) {
        setErrorDetails({
            title: "Store is Closed",
            message: "Please agree to schedule your order for the next opening time to proceed."
        });
        return;
    }

    if (paymentMethod === 'cod') {
      await placeOrder({ method: 'cod' });
    } else if (paymentMethod === 'upi_on_delivery') {
      await placeOrder({ method: 'upi_on_delivery' });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await proceedToPlaceOrder();
  };
  
  const onAddressChange = useCallback((newAddress: Address | null) => {
    setAddress(newAddress);
  }, []);

  const renderContent = () => {
    if (!isClient || authLoading || (cart.length === 0 && !authLoading) || totalPrice < MINIMUM_ORDER_VALUE) {
      return <CheckoutPageSkeleton />;
    }
    
    const canPlaceOrder = address !== null;
    const isLoading = isPlacingOrder;
    
    // Order can be placed if store is open, OR if it's closed but user agreed to schedule
    const canProceed = storeStatus.isOpen || (!storeStatus.isOpen && scheduleForNextDay);

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {!storeStatus.isOpen && (
            <StoreClosedWarning
                message={storeStatus.message}
                scheduleForNextDay={scheduleForNextDay}
                setScheduleForNextDay={setScheduleForNextDay}
            />
        )}
        {/* Pass deliveryCharge to OrderSummary */}
        <OrderSummary
          cart={cart}
          totalPrice={totalPrice}
          deliveryCharge={deliveryCharge}
          finalTotal={finalTotal}
        />
        
        {/* Delivery Address Form */}
        <DeliveryAddressForm onAddressChange={onAddressChange} />

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select how you want to pay for your order.</CardDescription>
          </CardHeader>
 <CardContent>
             <RadioGroup 
              value={paymentMethod} 
              onValueChange={(v) => {
                setPaymentMethod(v as 'cod' | 'upi_on_delivery');
                setErrorDetails(null);
              }} 
              className="space-y-4"
              disabled={isLoading}
            >
              <Label htmlFor="cod" className={`flex items-center gap-4 p-4 border rounded-lg has-[:checked]:bg-muted/50 has-[:checked]:border-secondary ${!isLoading ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <RadioGroupItem value="cod" id="cod" disabled={isLoading} />
                <div>
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                </div>
              </Label>
              <Label htmlFor="upi_on_delivery" className={`flex items-center gap-4 p-4 border rounded-lg has-[:checked]:bg-muted/50 has-[:checked]:border-secondary ${!isLoading ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <RadioGroupItem value="upi_on_delivery" id="upi_on_delivery" disabled={isLoading} />
                <div>
                  <p className="font-semibold">UPI on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay with UPI when your order arrives.</p>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Place Order Button */}
        <Button 
          type="submit" 
          variant="secondary"
          className="w-full" 
          size="lg"
          disabled={isLoading || !canPlaceOrder || !canProceed}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            storeStatus.isOpen ? `Place Order (${paymentMethod.replace(/_/g, ' ').toUpperCase()})` : `Schedule Order (${paymentMethod.replace(/_/g, ' ').toUpperCase()})`
          )}
        </Button>
      </form>
    );
  };

  const handleLoginRedirect = () => {
    router.push('/login');
    setErrorDetails(null);
  };

  const closeSuccessDialog = () => {
    setSuccessfulOrder(null);
    router.push('/?from=checkout');
  }

  return (
    <>
      {/* Success Dialog */}
      <AlertDialog open={!!successfulOrder}>
        <AlertDialogContent className="max-w-sm">
            <AlertDialogCancel 
                onClick={closeSuccessDialog}
                className="absolute right-2 top-2 p-1 h-auto bg-transparent border-none hover:bg-muted-foreground/20"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </AlertDialogCancel>
             <div className="text-center p-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl">Thank You!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your order has been placed successfully. Your order ID is:
                        <br />
                        <strong className="text-foreground">{successfulOrder}</strong>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex-col sm:flex-col sm:space-x-0 gap-2">
                     <Button asChild onClick={() => setSuccessfulOrder(null)}>
                         <Link href={`/my-orders/${successfulOrder}`}>Track Your Order</Link>
                    </Button>
                    <Button variant="outline" onClick={closeSuccessDialog}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Button>
                </AlertDialogFooter>
            </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={!!errorDetails} onOpenChange={() => setErrorDetails(null)}>
        <AlertDialogContent>
             <AlertDialogCancel className="absolute right-2 top-2 p-1 h-auto bg-transparent border-none hover:bg-muted-foreground/20">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDetails?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorDetails?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             {errorDetails?.title === "Login Required" ? (
                <AlertDialogAction onClick={handleLoginRedirect}>Login / Sign Up</AlertDialogAction>
             ) : (
                <AlertDialogAction onClick={() => setErrorDetails(null)}>OK</AlertDialogAction>
             )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-background">
        <header className="sticky top-0 z-10 flex items-center border-b bg-background p-2 md:p-4 h-[65px]">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Go back">
              <ChevronLeft />
            </Link>
          </Button>
          <h1 className="flex-1 text-center text-lg font-semibold font-headline">Checkout</h1>
          <div className="w-10" />
        </header>
        <main>
          <div className="container mx-auto max-w-2xl p-4 pb-24">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
}
