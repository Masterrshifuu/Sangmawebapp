
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
  orderBy,
  limit,
} from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/types';
import { format, addMinutes } from 'date-fns';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Logo from '../logo';
import { DynamicDeliveryTime } from '../DynamicDeliveryTime';

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
  const orderStatusHierarchy = [
    'pending',
    'confirmed',
    'outfordelivery',
    'delivered',
  ];
  const currentStatusIndex = orderStatusHierarchy.findIndex(
    s => s.toLowerCase() === status?.toLowerCase().replace(/[\s_]/g, '')
  );

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
        const stepStatusIndex = orderStatusHierarchy.findIndex(s => s.toLowerCase() === step.status.toLowerCase().replace(/[\s_]/g, ''));
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

const CountdownTimer = ({ order }: { order: Order}) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [eta, setEta] = useState('');

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
        calculateTimeLeft();
        const intervalId = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(intervalId);
    }, [calculateTimeLeft]);

    return (
        <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center space-y-1">
            <p className="text-sm">Estimated Delivery by {eta}</p>
            <p className="text-3xl font-bold flex items-center justify-center gap-2">
                <Timer />
                {timeLeft}
            </p>
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
    });
    return () => unsubscribe();
  }, []);
  
  const fetchOrders = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    setActiveOrder(null);

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef, 
        where('userId', '==', userId), 
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setLoading(false);
        return;
      }
      
      const foundActiveOrder = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Order;
      setActiveOrder(foundActiveOrder);

    } catch (err: any) {
      console.error('Error fetching order:', err);
      if (err.code === 'failed-precondition') {
             setError("This query requires a Firestore index. Please check the browser console for a link to create it, or check the 'Console Error' in the preview window.");
        } else {
             setError('An error occurred while fetching your order. Please try again later.');
        }
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (open && user) {
        fetchOrders(user.uid);
    } else if (open && !user) {
        setLoading(false);
        setActiveOrder(null);
    }
  }, [open, user, fetchOrders]);


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
                <CountdownTimer order={activeOrder} />
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
