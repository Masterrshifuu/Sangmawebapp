
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useLocation } from '@/hooks/use-location';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { calculateDeliveryCharge } from '@/lib/delivery';
import type { Order, Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronLeft, UserCheck, ShieldAlert } from 'lucide-react';
import { getStoreStatus } from '@/lib/datetime';
import { incrementUserStat } from '@/lib/user';
import { CheckoutPageSkeleton } from '@/components/pages/checkout/CheckoutPageSkeleton';
import { StoreClosedWarning } from '@/components/pages/checkout/StoreClosedWarning';
import { OrderSummary } from '@/components/pages/checkout/OrderSummary';
import { UnserviceableLocation } from '@/components/pages/checkout/UnserviceableLocation';
import { UpiPayment } from '@/components/pages/checkout/UpiPayment';
import { verifyPayment } from '@/app/actions';
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


export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const { address, loading: locationLoading } = useLocation();
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [storeStatus, setStoreStatus] = useState(getStoreStatus());
  const [scheduleForNextDay, setScheduleForNextDay] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentStatus = getStoreStatus();
    setStoreStatus(currentStatus);
    if (!currentStatus.isOpen) {
        setScheduleForNextDay(true);
    }

    const statusInterval = setInterval(() => {
        setStoreStatus(getStoreStatus());
    }, 1000 * 30);
    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    // Only redirect if cart is empty after initial load sequence
    if (isClient && !authLoading && cart.length === 0) {
        router.replace('/');
    }
  }, [isClient, cart.length, authLoading, router]);

  const deliveryCharge = useMemo(() => calculateDeliveryCharge(totalPrice, address), [totalPrice, address]);
  const finalTotal = useMemo(() => totalPrice + (deliveryCharge ?? 0), [totalPrice, deliveryCharge]);

  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentError(null);
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const placeOrder = async (paymentDetails: { method: 'cod' | 'upi', transactionId?: string }) => {
    if (deliveryCharge === null || !address) {
      setPaymentError('Unserviceable location.');
      return;
    }

    if (!storeStatus.isOpen && !scheduleForNextDay) {
      setPaymentError('Store is currently closed and order not scheduled.');
      return;
    }

    setIsPlacingOrder(true);
    const deliveryAddressString = `${address.area}${address.landmark ? ', ' + address.landmark : ''}, ${address.region}`;

    try {
      await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'orders');
        const counterDoc = await transaction.get(counterRef);

        let newOrderCount = 1;
        if (counterDoc.exists() && typeof counterDoc.data().current_count === 'number') {
          newOrderCount = counterDoc.data().current_count + 1;
        } else {
          console.error("Order counter document does not exist or is malformed!");
        }

        const newOrderId = `SMM${String(newOrderCount).padStart(6, '0')}`;
        const isScheduled = !storeStatus.isOpen;

        const orderData: Omit<Order, 'id'> = {
          userId: user?.uid || 'guest',
          userName: user?.displayName || 'Guest User',
          userEmail: user?.email || '',
          userPhone: address.phone || user?.phoneNumber || '',
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
          paymentTransactionId: paymentDetails.transactionId,
          status: isScheduled ? 'Scheduled' : 'Pending',
          totalAmount: finalTotal,
          active: !isScheduled,
          extraTimeInMinutes: 0,
          extraReasons: []
        };
        
        const newOrderRef = doc(db, 'orders', newOrderId);
        transaction.set(newOrderRef, orderData);
        transaction.update(counterRef, { current_count: newOrderCount });
      });

      if (user) {
        await incrementUserStat(user.uid, 'totalOrders');
      }

      clearCart();
      router.push('/my-orders');

    } catch (error) {
      console.error("Error placing order: ", error);
      setPaymentError('There was an error placing your order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
      setIsVerifying(false);
    }
  };
  
  const proceedToPlaceOrder = async () => {
    setPaymentError(null);

    if (paymentMethod === 'cod') {
      await placeOrder({ method: 'cod' });
    } else if (paymentMethod === 'upi') {
      if (!screenshotFile || !screenshotPreview) {
        setPaymentError("Please upload a payment screenshot.");
        return;
      }
      setIsVerifying(true);
      try {
        const result = await verifyPayment({
            screenshotDataUri: screenshotPreview,
            expectedAmount: finalTotal,
        });

        if (result.isPaymentVerified) {
          await placeOrder({ method: 'upi', transactionId: result.transactionId });
        } else {
          setPaymentError(`Payment Verification Failed: ${result.reason}`);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setPaymentError("An error occurred during payment verification.");
      } finally {
        setIsVerifying(false);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setShowGuestAlert(true);
    } else {
        await proceedToPlaceOrder();
    }
  };

  const renderContent = () => {
    if (!isClient || authLoading || locationLoading || (cart.length === 0 && !authLoading)) {
      return <CheckoutPageSkeleton />;
    }
    
    if (deliveryCharge === null) {
        return <UnserviceableLocation />;
    }

    const canPlaceOrder = storeStatus.isOpen || scheduleForNextDay;
    const isLoading = isPlacingOrder || isVerifying;

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {!storeStatus.isOpen && (
          <StoreClosedWarning
            message={storeStatus.message}
            scheduleForNextDay={scheduleForNextDay}
            setScheduleForNextDay={setScheduleForNextDay}
          />
        )}
        
        <OrderSummary
          cart={cart}
          totalPrice={totalPrice}
          deliveryCharge={deliveryCharge}
          finalTotal={finalTotal}
        />

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select how you want to pay for your order.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(v) => {
                setPaymentMethod(v as 'cod' | 'upi');
                setPaymentError(null);
              }} 
              className="space-y-4"
              disabled={isLoading}
            >
              <Label htmlFor="cod" className={`flex items-center gap-4 p-4 border rounded-lg has-[:checked]:bg-muted/50 has-[:checked]:border-primary ${canPlaceOrder && !isLoading ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <RadioGroupItem value="cod" id="cod" disabled={!canPlaceOrder || isLoading} />
                <div>
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                </div>
              </Label>
              <UpiPayment 
                paymentMethod={paymentMethod}
                canPlaceOrder={canPlaceOrder}
                finalTotal={finalTotal}
                screenshotPreview={screenshotPreview}
                screenshotFile={screenshotFile}
                handleScreenshotChange={handleScreenshotChange}
                isVerifying={isLoading}
              />
            </RadioGroup>
          </CardContent>
        </Card>
        
        {paymentError && (
            <p className="text-sm text-center font-medium text-destructive p-3 bg-destructive/10 rounded-lg">{paymentError}</p>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isLoading || !canPlaceOrder || (paymentMethod === 'upi' && !screenshotFile)}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            `Place Order (${paymentMethod.toUpperCase()})`
          )}
        </Button>
      </form>
    );
  };

  return (
    <>
      <AlertDialog open={showGuestAlert} onOpenChange={setShowGuestAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <UserCheck /> Proceed as Guest?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    You are not logged in. You can continue, but your order history will not be saved to an account.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="p-4 my-2 text-sm bg-amber-100 border-l-4 border-amber-500 text-amber-800 rounded-r-lg">
                <div className="flex items-start">
                    <ShieldAlert className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <span className="font-bold">Heads up!</span> Your order details will not be saved to an account. For any future queries, you'll need to contact support with your order ID.
                    </div>
                </div>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => router.push('/login')}>Login / Sign Up</AlertDialogCancel>
                <AlertDialogAction onClick={proceedToPlaceOrder}>Continue as Guest</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center border-b bg-background p-2 md:p-4 h-[65px]">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Go back">
              <ChevronLeft />
            </Link>
          </Button>
          <h1 className="flex-1 text-center text-lg font-semibold font-headline">Checkout</h1>
          <div className="w-10" />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-2xl p-4">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
}
