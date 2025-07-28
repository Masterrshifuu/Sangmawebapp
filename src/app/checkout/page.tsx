
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
import { verifyPayment, VerifyPaymentInput } from '@/ai/flows/verify-payment-flow';
import type { Order, Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, ChevronLeft, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { getStoreStatus } from '@/lib/datetime';
import { incrementUserStat } from '@/lib/user';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckoutPageSkeleton } from '@/components/pages/checkout/CheckoutPageSkeleton';
import { UpiPayment } from '@/components/pages/checkout/UpiPayment';
import { StoreClosedWarning } from '@/components/pages/checkout/StoreClosedWarning';
import { OrderSummary } from '@/components/pages/checkout/OrderSummary';
import { UnserviceableLocation } from '@/components/pages/checkout/UnserviceableLocation';


export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const { address, loading: locationLoading } = useLocation();
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [storeStatus, setStoreStatus] = useState(getStoreStatus());
  const [scheduleForNextDay, setScheduleForNextDay] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
    if (isClient && cart.length === 0 && !authLoading) {
        router.replace('/');
    }
  }, [isClient, cart.length, authLoading, router]);

  const deliveryCharge = useMemo(() => calculateDeliveryCharge(totalPrice, address), [totalPrice, address]);
  const finalTotal = useMemo(() => totalPrice + (deliveryCharge ?? 0), [totalPrice, deliveryCharge]);

  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const placeOrder = async (isVerified: boolean = false) => {
    if (!user || deliveryCharge === null || !address) {
        console.error('Login Required or unserviceable location.');
        return;
    };

    if (!storeStatus.isOpen && !scheduleForNextDay) {
        console.error('Store is currently closed and order not scheduled.');
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
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userEmail: user.email || '',
                userPhone: address.phone || user.phoneNumber || '',
                createdAt: serverTimestamp(),
                deliveryAddress: deliveryAddressString,
                items: cart.map(item => ({
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.mrp || item.product.price,
                    quantity: item.quantity,
                    imageUrl: item.product.imageUrl
                })),
                paymentMethod,
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

        await incrementUserStat(user.uid, 'totalOrders');

        clearCart();
        router.push('/my-orders');

    } catch (error) {
        console.error("Error placing order: ", error);
    } finally {
        setIsPlacingOrder(false);
    }
  };

  const handleUpiVerification = async () => {
    if (!screenshotFile) {
        console.error('Please upload a screenshot.');
        return;
    }
    setIsVerifying(true);
    try {
        const photoDataUri = await fileToDataUri(screenshotFile);
        const input: VerifyPaymentInput = {
            photoDataUri,
            expectedAmount: finalTotal.toString(),
        };
        const result = await verifyPayment(input);
        
        if (result.isPaymentVerified) {
            await placeOrder(true);
        } else {
            console.error(result.reason || 'The amount in the screenshot does not match the order total.');
        }
    } catch (error) {
        console.error("Verification error:", error);
    } finally {
        setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        console.error('You must be logged in to place an order.');
        return;
    }
    if (paymentMethod === 'cod') {
        await placeOrder();
    } else {
        await handleUpiVerification();
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
                        onValueChange={(v) => setPaymentMethod(v as 'cod' | 'upi')} 
                        className="space-y-4"
                        disabled={!canPlaceOrder}
                    >
                        <Label htmlFor="cod" className={`flex items-center gap-4 p-4 border rounded-lg has-[:checked]:bg-muted/50 has-[:checked]:border-primary ${canPlaceOrder ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                            <RadioGroupItem value="cod" id="cod" disabled={!canPlaceOrder} />
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
                            isVerifying={isVerifying || isPlacingOrder}
                        />
                    </RadioGroup>
                </CardContent>
            </Card>

            <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isPlacingOrder || isVerifying || (paymentMethod === 'upi' && !screenshotFile) || !canPlaceOrder}
            >
                {isPlacingOrder || isVerifying ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    paymentMethod === 'cod' ? `Place Order (COD)` : `Verify & Place Order`
                )}
            </Button>
        </form>
    );
  };

  return (
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
  );
}
