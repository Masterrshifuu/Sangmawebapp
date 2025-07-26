
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useLocation } from '@/hooks/use-location';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { calculateDeliveryCharge } from '@/lib/delivery';
import { verifyPayment, VerifyPaymentInput } from '@/ai/flows/verify-payment-flow';
import type { CartItem, Order, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, ChevronLeft, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from '../ui/drawer';
import { ScrollArea } from '../ui/scroll-area';
import { getStoreStatus } from '@/lib/datetime';
import { createOrderTimer } from '@/lib/timer';

interface CheckoutSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CheckoutPageSkeleton = () => (
    <div className="p-4">
        <div className="animate-pulse space-y-8">
            <div className="space-y-2">
                <div className="h-8 w-1/2 bg-muted rounded"></div>
                <div className="h-4 w-1/3 bg-muted rounded"></div>
            </div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
        </div>
    </div>
)

export function CheckoutSheet({ open, onOpenChange }: CheckoutSheetProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const { location } = useLocation();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [storeStatus, setStoreStatus] = useState(getStoreStatus());

  useEffect(() => {
    // Re-check store status when the sheet opens
    if (open) {
        const statusInterval = setInterval(() => {
            setStoreStatus(getStoreStatus());
        }, 1000 * 30); // check every 30 seconds
        return () => clearInterval(statusInterval);
    }
  }, [open]);

  useEffect(() => {
    // Reset state when the sheet is closed
    if (!open) {
        setPaymentMethod('cod');
        setScreenshotFile(null);
        setScreenshotPreview(null);
        setIsPlacingOrder(false);
        setIsVerifying(false);
    }
  }, [open]);

  // Safely close the sheet if the cart becomes empty while it's open
  useEffect(() => {
    if (open && cart.length === 0) {
        onOpenChange(false);
    }
  }, [open, cart.length, onOpenChange]);


  const deliveryCharge = useMemo(() => calculateDeliveryCharge(totalPrice, location), [totalPrice, location]);
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
    if (!user || deliveryCharge === null || !storeStatus.isOpen) return;
    setIsPlacingOrder(true);

    const orderData: Order = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userEmail: user.email || '',
      userPhone: user.phoneNumber || '',
      createdAt: serverTimestamp(),
      deliveryAddress: location,
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.mrp || item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl
      })),
      paymentMethod,
      status: 'placed',
      totalAmount: finalTotal,
      estimatedDeliveryTime: 35,
      extraTime: 0,
      finalETA: 35,
    };

    try {
      const orderDocRef = await addDoc(collection(db, 'orders'), orderData);
      // Create the timer document as well
      await createOrderTimer(orderDocRef.id, user.uid);

      toast({
        title: 'Order Placed Successfully!',
        description: 'Thank you for your purchase. You can track your order in the tracking section.',
      });
      clearCart();
      onOpenChange(false);
      router.push('/?order=success');
    } catch (error) {
      console.error("Error placing order: ", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Place Order',
        description: 'There was an error while placing your order. Please try again.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleUpiVerification = async () => {
    if (!screenshotFile) {
        toast({ variant: 'destructive', title: 'Please upload a screenshot.' });
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
            toast({
                title: 'Payment Verified!',
                description: 'Your payment has been successfully verified. Placing your order now.',
            });
            await placeOrder(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'Payment Verification Failed',
                description: result.reason || 'The amount in the screenshot does not match the order total. Please try again.',
            });
        }
    } catch (error) {
        console.error("Verification error:", error);
        toast({
            variant: 'destructive',
            title: 'Verification Error',
            description: 'An unexpected error occurred during verification.',
        });
    } finally {
        setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'cod') {
        await placeOrder();
    } else {
        await handleUpiVerification();
    }
  };

  const renderContent = () => {
    if (authLoading) return <CheckoutPageSkeleton />;

    if (!user && !authLoading) {
        return <CheckoutPageSkeleton />;
    }
    
    if (cart.length === 0) {
      return <CheckoutPageSkeleton />;
    }
    
    if (deliveryCharge === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
                <h2 className="text-2xl font-bold">Unserviceable Location</h2>
                <p className="text-muted-foreground mt-2">We do not deliver to your selected location.</p>
                <Button onClick={() => onOpenChange(false)} className="mt-4">Go Back</Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {!storeStatus.isOpen && (
                <Card className="border-yellow-400 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-800">
                           <AlertCircle /> Store Closed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-yellow-700">
                        {storeStatus.message}
                    </CardContent>
                </Card>
             )}
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                        {cart.map(item => (
                            <div key={item.product.id} className="flex justify-between">
                                <span className="text-muted-foreground flex-1 truncate pr-2">{item.product.name} x {item.quantity}</span>
                                <span>INR {(item.product.mrp * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm font-medium">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>INR {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery Fee</span>
                            <span>{deliveryCharge === 0 ? 'FREE' : `INR ${deliveryCharge.toFixed(2)}`}</span>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span>INR {finalTotal.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Select how you want to pay for your order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cod' | 'upi')} className="space-y-4">
                        <Label htmlFor="cod" className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-muted/50 has-[:checked]:border-primary">
                            <RadioGroupItem value="cod" id="cod" />
                            <div>
                                <p className="font-semibold">Cash on Delivery</p>
                                <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                            </div>
                        </Label>
                        <Label htmlFor="upi" className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-muted/50 has-[:checked]:border-primary">
                             <RadioGroupItem value="upi" id="upi" />
                            <div className="flex-1">
                                <p className="font-semibold">Pay with UPI</p>
                                <p className="text-sm text-muted-foreground">Scan the QR code and upload a screenshot of your payment.</p>
                                {paymentMethod === 'upi' && (
                                    <div className="mt-4 space-y-4">
                                        <div className="bg-white p-2 rounded-md max-w-[200px] mx-auto">
                                             <Image 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=YOUR_UPI_ID@OKBANK&pn=Sangma%20Megha%20Mart&am=${finalTotal.toFixed(2)}&cu=INR`}
                                                alt="UPI QR Code"
                                                width={200}
                                                height={200}
                                                className="w-full h-full"
                                                data-ai-hint="QR code"
                                            />
                                        </div>
                                        {screenshotPreview && (
                                            <div className="mt-2 text-center">
                                                <Image src={screenshotPreview} alt="Screenshot preview" width={150} height={300} className="rounded-md mx-auto border" />
                                            </div>
                                        )}
                                        <Label htmlFor="screenshot-upload" className="w-full">
                                            <div className="mt-2 flex justify-center items-center px-6 py-4 border-2 border-dashed rounded-md cursor-pointer hover:border-primary">
                                                <div className="text-center">
                                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground"/>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {screenshotFile ? 'Change screenshot' : 'Upload payment screenshot'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Input 
                                                id="screenshot-upload" 
                                                type="file" 
                                                className="sr-only" 
                                                accept="image/*"
                                                onChange={handleScreenshotChange}
                                                disabled={isVerifying || isPlacingOrder}
                                            />
                                        </Label>
                                    </div>
                                )}
                            </div>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isPlacingOrder || isVerifying || (paymentMethod === 'upi' && !screenshotFile) || !storeStatus.isOpen}
            >
                {isPlacingOrder || isVerifying ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    paymentMethod === 'cod' ? `Place Order (COD)` : `Verify & Place Order`
                )}
            </Button>
        </form>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-full md:h-[90vh] flex flex-col p-0">
            <DrawerHeader className="p-4 pt-4 border-b flex items-center justify-between">
                <DrawerClose asChild>
                    <Button variant="ghost" size="icon">
                        <ChevronLeft />
                        <span className="sr-only">Back</span>
                    </Button>
                </DrawerClose>
                <DrawerTitle className="flex-1 text-center">Checkout</DrawerTitle>
                <div className="w-10" />
            </DrawerHeader>
            <ScrollArea className="flex-1">
                <div className="p-4">
                    {renderContent()}
                </div>
            </ScrollArea>
        </DrawerContent>
    </Drawer>
  );
}
