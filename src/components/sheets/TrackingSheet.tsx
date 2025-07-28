
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  CheckCircle2,
  Package,
  Truck,
  Home,
  Timer,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  getDocs,
  Timestamp,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/types';
import { format, addMinutes, differenceInMinutes } from 'date-fns';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Logo from '../logo';
import { DynamicDeliveryTime } from '../DynamicDeliveryTime';
import { cancelOrder } from '@/app/actions';

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
            sizes="20vw"
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
  const normalizedStatus = status || 'Pending';
  const orderStatusHierarchy = [
    'Pending',
    'Confirmed',
    'Packed',
    'OutForDelivery',
    'Delivered',
  ];

  if (normalizedStatus === 'Cancelled') {
    return (
        <div className="p-4 rounded-lg border bg-red-50 text-red-800 text-center">
            <h3 className="font-semibold">Order Cancelled</h3>
            <p className="text-sm">This order has been cancelled.</p>
        </div>
    )
  }
   if (normalizedStatus === 'Scheduled') {
    return (
        <div className="p-4 rounded-lg border bg-purple-50 text-purple-800 text-center">
            <h3 className="font-semibold">Order Scheduled</h3>
            <p className="text-sm">Your order is scheduled and will begin processing at the next opening time.</p>
        </div>
    )
  }

  const currentStatusIndex = orderStatusHierarchy.indexOf(normalizedStatus);

  const steps = [
    {
      icon: Package,
      title: 'Order Placed',
      status: 'Pending',
      description: 'We have received your order.',
    },
    {
      icon: CheckCircle2,
      title: 'Order Confirmed',
      status: 'Confirmed',
      description: 'Your order has been confirmed.',
    },
    {
      icon: Package,
      title: 'Packed',
      status: 'Packed',
      description: 'Your items are being packed.',
    },
    {
      icon: Truck,
      title: 'Out for Delivery',
      status: 'OutForDelivery',
      description: 'Your order is on its way.',
    },
    {
      icon: Home,
      title: 'Delivered',
      status: 'Delivered',
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
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-accent text-accent-foreground animate-pulse',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
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
                  (isCompleted || isCurrent)
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

const NoActiveOrderCard = () => (
    <div className="space-y-4">
        <div className="p-4 rounded-lg border text-center">
            <h3 className="text-lg font-semibold">No Active Orders</h3>
            <p className="text-sm text-muted-foreground">Place a new order to track it here!</p>
        </div>
        <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center space-y-1">
            <p className="text-sm">Next Estimated Delivery</p>
            <DynamicDeliveryTime className="text-3xl font-bold !text-accent-foreground justify-center" />
        </div>
    </div>
)

const OrderStatusCard = ({ order }: { order: Order}) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [eta, setEta] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const calculateTimeLeft = useCallback(() => {
        const orderTimestamp = order.createdAt as unknown as Timestamp;
        if (!orderTimestamp) {
          setTimeLeft('Calculating...');
          setEta('');
          return;
        };

        const orderTime = orderTimestamp.toDate();
        const etaMinutes = 35 + (order.extraTimeInMinutes || 0);
        const etaTime = addMinutes(orderTime, etaMinutes);
        setEta(format(etaTime, 'p'));

        const now = new Date();
        const difference = etaTime.getTime() - now.getTime();

        if (difference <= 0) {
            setTimeLeft('Arriving soon');
            return;
        }

        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, [order]);

    useEffect(() => {
        if (order.status === 'Delivered' || order.status === 'Cancelled') {
            return;
        }
        calculateTimeLeft();
        const intervalId = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(intervalId);
    }, [calculateTimeLeft, order.status]);

    const isCancellable = () => {
        if (!order.createdAt) return false;
        const createdAt = (order.createdAt as unknown as Timestamp).toDate();
        const now = new Date();
        const minutesSinceOrder = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        const cancellableStatuses = ['Pending', 'Confirmed', 'Packed', 'Scheduled'];
        return minutesSinceOrder < 5 && cancellableStatuses.includes(order.status);
    };

    const handleCancelOrder = async () => {
        if (!order.id || !isCancellable()) return;
        setIsCancelling(true);
        const result = await cancelOrder(order.id);
        if (result.success) {
            console.log("Order Cancelled");
        } else {
            console.error("Cancellation Failed:", result.message);
        }
        setIsCancelling(false);
    };

    if (order.status === 'Delivered') {
        const createdAt = (order.createdAt as unknown as Timestamp).toDate();
        const deliveredAt = (order.cancelledAt as unknown as Timestamp)?.toDate() || new Date(); 
        const deliveryDuration = differenceInMinutes(deliveredAt, createdAt);

        return (
            <div className="p-4 rounded-lg bg-green-100 text-green-800 text-center space-y-1">
                <p className="text-sm font-semibold flex items-center justify-center gap-2"><CheckCircle2 />Delivered</p>
                <p className="text-lg font-bold">
                   Delivered in {deliveryDuration} minutes
                </p>
            </div>
        )
    }

    if (order.status === 'Cancelled') {
        return (
            <div className="p-4 rounded-lg bg-red-100 text-red-800 text-center space-y-1">
                <p className="text-sm font-semibold flex items-center justify-center gap-2"><XCircle />Order Cancelled</p>
                <p className="text-lg font-bold">This order was cancelled.</p>
            </div>
        )
    }


    return (
        <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center space-y-1">
                <p className="text-sm">Estimated Delivery by {eta}</p>
                <p className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Timer />
                    {timeLeft}
                </p>
            </div>
            {isCancellable() && (
                 <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </Button>
            )}
        </div>
    )
};


export function TrackingSheet({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setActiveOrder(null);
      }
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!open || !user) {
        if (!user) setLoading(false);
        return;
    }
    
    setLoading(true);

    const ordersRef = collection(db, 'orders');
    const q = query(
        ordersRef, 
        where('userId', '==', user.uid), 
        where('active', '==', true)
    );
      
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
            setActiveOrder(null);
        } else {
            const activeOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            activeOrders.sort((a, b) => {
                const dateA = (a.createdAt as unknown as Timestamp).toDate();
                const dateB = (b.createdAt as unknown as Timestamp).toDate();
                return dateB.getTime() - dateA.getTime();
            });
            setActiveOrder(activeOrders[0]);
        }
        setLoading(false);
    }, (err) => {
        console.error('Error with real-time order listener:', err);
        setError('An error occurred while tracking your order.');
        setLoading(false);
    });

    return () => unsubscribe();

  }, [open, user]);


  return (
    <Drawer open={open} onOpenChange={setOpen}>
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
            {loading ? (
                <div className="flex flex-col justify-center items-center p-8 space-y-4">
                    <Logo className="animate-pulse" />
                    <p className="text-muted-foreground text-sm">Finding your orders...</p>
                </div>
            ) : error ? (
                <div className="p-4 text-center text-red-500 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            ) : activeOrder ? (
              <>
                <OrderStatusCard order={activeOrder} />
                <TrackingTimeline status={activeOrder.status} />
                <OrderSummaryCard items={activeOrder.items} />
              </>
            ) : (
              <NoActiveOrderCard />
            )}
          </div>
        </main>
      </DrawerContent>
    </Drawer>
  );
}
