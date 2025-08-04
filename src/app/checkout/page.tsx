

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
import { Loader2, ChevronLeft, LogIn, ShieldAlert, X } from 'lucide-react';
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
import { DialogClose } from '@radix-ui/react-dialog';
import { DeliveryAddressForm } from '@/components/pages/checkout/DeliveryAddressForm';


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
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
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
    if (!user) {
        setShowGuestAlert(true);
        return;
    }

    if (deliveryCharge === null || !address || !address.phone) {
      setPaymentError('Please provide a valid delivery address and phone number.');
      return;
    }
    
    if (totalPrice < MINIMUM_ORDER_VALUE) {
        setPaymentError(`Minimum order value is ₹${MINIMUM_ORDER_VALUE}.`);
        return;
    }

    setIsPlacingOrder(true);
    const deliveryAddressString = `${address.area}${address.landmark ? ', ' + address.landmark : ''}, ${address.region}`;

    try {
        const orderData: Omit<Order, 'id'> = {
          userId: user.uid,
          userName: user.displayName || 'Valued Customer',
          userEmail: user.email || '',
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
          paymentTransactionId: paymentDetails.transactionId,
          status: 'Pending',
          totalAmount: finalTotal,
          active: true,
          extraTimeInMinutes: 0,
          extraReasons: []
        };
        
        const ordersCollection = collection(db, 'orders');
        await addDoc(ordersCollection, orderData);

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
    if (!isClient || authLoading || (cart.length === 0 && !authLoading) || totalPrice < MINIMUM_ORDER_VALUE) {
      return <CheckoutPageSkeleton />;
    }
    
    const canPlaceOrder = deliveryCharge !== null;
    const isLoading = isPlacingOrder || isVerifying;

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
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
                setPaymentError(null);
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
                canPlaceOrder={true}
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
            <DialogClose asChild>
                <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </DialogClose>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <LogIn /> Please Log In
                </AlertDialogTitle>
                <AlertDialogDescription>
                    You need to be logged in to an account to place an order. It's quick and helps you track your orders!
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => router.push('/login')}>Login / Sign Up</AlertDialogAction>
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
