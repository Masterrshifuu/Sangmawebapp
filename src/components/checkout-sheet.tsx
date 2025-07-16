'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { createOrder, type OrderCreationData } from '@/lib/orders';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { User } from 'firebase/auth';
import { ScrollArea } from './ui/scroll-area';
import { OrderConfirmationDialog } from './order-confirmation-dialog';

enum CheckoutStep {
  ADDRESS,
  CONTACT,
  PAYMENT,
  SUMMARY,
}

export function CheckoutSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<CheckoutStep>(CheckoutStep.ADDRESS);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setPhone(currentUser.phoneNumber || '');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const needsContactInfo = useMemo(() => {
    if (!user) return true;
    return !user.phoneNumber;
  }, [user]);

  useEffect(() => {
    if (open) {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        setAddress(savedLocation);
        if (needsContactInfo) {
          setStep(CheckoutStep.CONTACT);
        } else {
          setStep(CheckoutStep.PAYMENT);
        }
      } else {
        setStep(CheckoutStep.ADDRESS);
      }
    }
  }, [open, needsContactInfo]);

  useEffect(() => {
    if (step === CheckoutStep.CONTACT && !needsContactInfo && open) {
      setStep(CheckoutStep.PAYMENT);
    }
  }, [step, needsContactInfo, open]);

  const handleBack = () => {
    if (step === CheckoutStep.SUMMARY) setStep(CheckoutStep.PAYMENT);
    if (step === CheckoutStep.PAYMENT) {
      if (needsContactInfo) setStep(CheckoutStep.CONTACT);
      else setStep(CheckoutStep.ADDRESS);
    }
    if (step === CheckoutStep.CONTACT) setStep(CheckoutStep.ADDRESS);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Address',
        description: 'Please enter a valid, detailed address.',
      });
      return;
    }
    localStorage.setItem('userLocation', address);
    setStep(needsContactInfo ? CheckoutStep.CONTACT : CheckoutStep.PAYMENT);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\+?[1-9]\d{9,14}$/.test(phone)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number.',
      });
      return;
    }
    setStep(CheckoutStep.PAYMENT);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(CheckoutStep.SUMMARY);
  };

  const handleConfirmOrder = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'Please log in to place an order.',
      });
      return;
    }
    setLoading(true);
    try {
      const orderData: OrderCreationData = {
        userId: user.uid,
        userName: user.displayName || null,
        userEmail: user.email || null,
        userPhone: phone || user.phoneNumber || '',
        deliveryAddress: address,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        totalAmount: cartTotal,
        paymentMethod,
      };

      await createOrder(orderData);

      clearCart();
      setOpen(false);
      setShowConfirmation(true);
    } catch (error: any) {
      console.error(error);
      const detailedMessage = error.message.includes('permission-denied')
        ? 'Permission denied. Please ensure you are logged in.'
        : error.message || 'There was an error placing your order. Please try again.';

      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: detailedMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = () => {
    setShowConfirmation(false);
    router.push('/track-order');
  };

  const handleContinueShopping = () => {
    setShowConfirmation(false);
  };
  
  const renderStep = () => {
    // Show a global loader if user state is not resolved yet
    if (loading && !user) {
      return (
        <div className="flex justify-center items-center h-full py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    switch (step) {
      case CheckoutStep.ADDRESS:
        return (
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., House No, Street, Landmark"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        );
      case CheckoutStep.CONTACT:
        if (!needsContactInfo) return null;
        return (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 9876543210"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        );
      case CheckoutStep.PAYMENT:
        return (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v: 'COD' | 'UPI') => setPaymentMethod(v)}
              className="space-y-2"
            >
              <Label>Select Payment Method</Label>
              <div className="flex items-center space-x-2 p-3 rounded-md border">
                <RadioGroupItem value="COD" id="cod" />
                <Label htmlFor="cod" className="font-normal w-full cursor-pointer">Cash on Delivery (COD)</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-md border">
                <RadioGroupItem value="UPI" id="upi" />
                <Label htmlFor="upi" className="font-normal w-full cursor-pointer">UPI (Pay on Delivery)</Label>
              </div>
            </RadioGroup>
            <Button type="submit" className="w-full">
              Continue to Summary
            </Button>
          </form>
        );
      case CheckoutStep.SUMMARY:
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Delivery Address</h4>
              <p className="text-muted-foreground">{address}</p>
            </div>
            <div>
              <h4 className="font-semibold">Contact</h4>
              <p className="text-muted-foreground">{phone || user?.phoneNumber}</p>
            </div>
            <div>
              <h4 className="font-semibold">Payment Method</h4>
              <p className="text-muted-foreground">{paymentMethod}</p>
              {paymentMethod === 'UPI' && (
                <p className="text-xs text-muted-foreground">
                  You can pay using UPI at the time of delivery.
                </p>
              )}
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Order Items</h4>
              <ScrollArea className="max-h-48">
                <div className="space-y-4 pr-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 text-sm">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded-md object-contain h-10 w-10 border"
                        data-ai-hint="product image"
                      />
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <p className="font-medium text-foreground line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">
                        INR {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-between font-bold mt-4 text-lg border-t pt-4">
                <span>Total</span>
                <span>INR {cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={handleConfirmOrder} className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {paymentMethod === 'COD' ? 'Confirm Order' : 'Place Order'}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case CheckoutStep.ADDRESS:
        return 'Delivery Address';
      case CheckoutStep.CONTACT:
        return 'Contact Information';
      case CheckoutStep.PAYMENT:
        return 'Payment Method';
      case CheckoutStep.SUMMARY:
        return 'Order Summary';
      default:
        return 'Checkout';
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[90vh] flex flex-col p-0 rounded-t-2xl"
          showCloseButton={false}
        >
          <div className="flex justify-center py-3" onClick={() => setOpen(false)}>
              <div className="w-12 h-1.5 rounded-full bg-muted" />
          </div>
          <SheetHeader className="p-4 pt-0 border-b flex flex-row items-center">
            {step > CheckoutStep.ADDRESS && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <SheetTitle className="flex-1">{getTitle()}</SheetTitle>
          </SheetHeader>
          <div className="p-4 flex-1 overflow-y-auto">{renderStep()}</div>
        </SheetContent>
      </Sheet>
      <OrderConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onTrackOrder={handleTrackOrder}
        onContinueShopping={handleContinueShopping}
      />
    </>
  );
}
