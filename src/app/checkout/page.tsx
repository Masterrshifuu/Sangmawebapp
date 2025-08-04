
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { calculateDeliveryCharge } from '@/lib/delivery';
import type { Order, Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronLeft, X } from 'lucide-react';
import { incrementUserStat } from '@/lib/user';
import { CheckoutPageSkeleton } from '@/components/pages/checkout/CheckoutPageSkeleton';
import { OrderSummary } from '@/components/pages/checkout/OrderSummary';
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
import { DeliveryAddressForm } from '@/components/pages/checkout/DeliveryAddressForm';
import { getStoreStatus } from '@/lib/datetime';
import { StoreClosedWarning } from '@/components/pages/checkout/StoreClosedWarning';


export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  
  const [address, setAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ title: string; message: string; } | null>(null);
  const [scheduleForNextDay, setScheduleForNextDay] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
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
      if (!address || !address.region) {
          return 50; 
      }
      return calculateDeliveryCharge(totalPrice, address);
  }, [totalPrice, address]);
  const finalTotal = useMemo(() => totalPrice + (deliveryCharge ?? 0), [totalPrice, deliveryCharge]);

  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setErrorDetails(null);
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const placeOrder = async (paymentDetails: { method: 'cod' | 'upi', transactionId?: string }) => {
    if (deliveryCharge === null || !address || !address.phone) {
      setErrorDetails({
        title: 'Invalid Address',
        message: 'Please provide a valid delivery address and phone number.'
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

        const baseOrderData = {
          userId: user?.uid || 'guest',
          userName: user?.displayName || 'Guest Customer',
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
          extraTimeInMinutes: 0,
          extraReasons: []
        };
        
        let orderData: Omit<Order, 'id'>;

        if (paymentDetails.method === 'upi') {
          orderData = { 
            ...baseOrderData, 
            paymentTransactionId: paymentDetails.transactionId 
          };
        } else {
          // Destructure to remove paymentTransactionId for COD
          const { paymentTransactionId, ...codOrderData } = { ...baseOrderData, paymentTransactionId: undefined };
          orderData = codOrderData;
        }

        const ordersCollection = collection(db, 'orders');
        await addDoc(ordersCollection, orderData);

        if (user) {
            await incrementUserStat(user.uid, 'totalOrders');
        }

        clearCart();
        router.push('/my-orders');

    } catch (error: any) {
      console.error("Error placing order: ", error);
      setErrorDetails({
          title: "Order Placement Failed",
          message: `An error occurred while communicating with the server. Please check the details and try again. Error: ${error.message}`
      });
    } finally {
      setIsPlacingOrder(false);
      setIsVerifying(false);
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
    } else if (paymentMethod === 'upi') {
      if (!screenshotFile || !screenshotPreview) {
        setErrorDetails({
            title: "Screenshot Missing",
            message: "Please upload a payment screenshot to proceed with a UPI order."
        });
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
          setErrorDetails({
              title: "Payment Verification Failed",
              message: `Reason: ${result.reason}. Please check your payment and try again.`
          });
        }
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        setErrorDetails({
            title: "Verification Service Error",
            message: `An error occurred during payment verification. Error: ${error.message}`
        });
      } finally {
        setIsVerifying(false);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await proceedToPlaceOrder();
  };

  const renderContent = () => {
    if (!isClient || authLoading || (cart.length === 0 && !authLoading) || totalPrice < MINIMUM_ORDER_VALUE) {
      return <CheckoutPageSkeleton />;
    }
    
    const canPlaceOrder = address !== null;
    const isLoading = isPlacingOrder || isVerifying;
    const isScheduleRequired = !storeStatus.isOpen && !scheduleForNextDay;


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
        
        <DeliveryAddressForm onAddressChange={setAddress} />

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
                setErrorDetails(null);
              }} 
              className="space-y-4"
              disabled={isLoading}
            >
              <Label htmlFor="cod" className={`flex items-center gap-4 p-4 border rounded-lg has-[:checked]:bg-muted/50 has-[:checked]:border-primary ${!isLoading ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <RadioGroupItem value="cod" id="cod" disabled={isLoading} />
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
        
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isLoading || !canPlaceOrder || (paymentMethod === 'upi' && !screenshotFile) || isScheduleRequired}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            storeStatus.isOpen ? `Place Order (${paymentMethod.toUpperCase()})` : `Schedule Order (${paymentMethod.toUpperCase()})`
          )}
        </Button>
      </form>
    );
  };

  const handleLoginRedirect = () => {
    router.push('/login');
    setErrorDetails(null);
  };

  return (
    <>
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
