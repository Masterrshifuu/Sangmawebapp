
'use client';

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  CheckCircle2,
  Package,
  Truck,
  Home,
  Loader2,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/types';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const OrderSummaryCard = ({ items }: { items: OrderItem[] }) => {
  const firstItem = items[0];
  const remainingItemsCount = items.length - 1;

  if (!firstItem) return null;

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <h3 className="font-semibold mb-2">Your Order</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted/40">
          <Image
            src={firstItem.imageUrl}
            alt={firstItem.name}
            fill
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <p className="font-medium">{firstItem.name}</p>
          {remainingItemsCount > 0 && (
            <p className="text-sm text-muted-foreground">
              and {remainingItemsCount} other item
              {remainingItemsCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const TrackingTimeline = ({ status }: { status: string }) => {
  const orderStatusHierarchy = [
    'placed',
    'confirmed',
    'packed',
    'out_for_delivery',
    'delivered',
  ];
  const currentStatusIndex = orderStatusHierarchy.indexOf(
    status.toLowerCase()
  );

  const steps = [
    {
      icon: Package,
      title: 'Order Placed',
      status: 'placed',
      description: 'We have received your order.',
    },
    {
      icon: CheckCircle2,
      title: 'Order Confirmed',
      status: 'confirmed',
      description: 'Your order has been confirmed.',
    },
    {
      icon: Package,
      title: 'Being Prepared',
      status: 'packed',
      description: 'Your order is being prepared.',
    },
    {
      icon: Truck,
      title: 'Out for Delivery',
      status: 'out_for_delivery',
      description: 'Your order is on its way.',
    },
    {
      icon: Home,
      title: 'Delivered',
      status: 'delivered',
      description: 'Your order has been delivered.',
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const stepStatusIndex = orderStatusHierarchy.indexOf(step.status);
        const isCompleted = stepStatusIndex < currentStatusIndex;
        const isCurrent = stepStatusIndex === currentStatusIndex;

        return (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  isCompleted || isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <step.icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                ></div>
              )}
            </div>
            <div className="flex-1 pb-4">
              <p
                className={cn(
                  'font-semibold',
                  isCompleted || isCurrent
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function TrackingSheet({ children }: { children: React.ReactNode }) {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<Date | null>(null);

  const handleTrackOrder = async () => {
    if (!orderId) {
      setError('Please enter an Order ID.');
      return;
    }
    setLoading(true);
    setError(null);
    setOrder(null);
    setEstimatedDeliveryTime(null);

    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        const createdAt = (orderData.createdAt as Timestamp).toDate();

        // Calculate estimated delivery time (25 to 45 mins from createdAt)
        const randomMinutes = Math.floor(Math.random() * (45 - 25 + 1)) + 25;
        const deliveryTime = new Date(createdAt.getTime() + randomMinutes * 60000);
        setEstimatedDeliveryTime(deliveryTime);

        setOrder({ id: orderSnap.id, ...orderData } as Order);
      } else {
        setError(`No order found with ID "${orderId}". Please check the ID and try again.`);
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError('An error occurred while fetching your order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-full md:h-[80vh] flex flex-col p-0">
        <DrawerHeader className="p-4 pt-4 text-center flex items-center justify-between border-b">
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="md:flex hidden">
              <ChevronLeft />
              <span className="sr-only">Back</span>
            </Button>
          </DrawerClose>
          <DrawerTitle className="flex-1 text-center">
            Track Your Order
          </DrawerTitle>
          <div className="w-10 md:block hidden" />
        </DrawerHeader>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Order ID (e.g., SMM000001)"
                className="flex-1"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.trim())}
                onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
              />
              <Button onClick={handleTrackOrder} disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Search />
                )}
                <span className="sr-only">Track</span>
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && !order && !error && (
                 <div className="text-center text-muted-foreground p-8">
                    <Truck className="mx-auto h-12 w-12 mb-4"/>
                    <p>Enter your order ID to see its status.</p>
                </div>
            )}

            {loading && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {order && (
              <>
                {estimatedDeliveryTime && order.status !== 'delivered' && (
                  <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center">
                    <p className="text-sm">Estimated Delivery</p>
                    <p className="text-2xl font-bold">
                      {format(estimatedDeliveryTime, 'hh:mm a')}
                    </p>
                  </div>
                )}
                <TrackingTimeline status={order.status} />
                <OrderSummaryCard items={order.items} />
              </>
            )}
          </div>
        </main>
      </DrawerContent>
    </Drawer>
  );
}
