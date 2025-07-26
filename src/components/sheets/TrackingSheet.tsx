
'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/types';
import { format } from 'date-fns';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Logo from '../logo';

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
    'placed',
    'confirmed',
    'packed',
    'out_for_delivery',
    'delivered',
  ];
  const currentStatusIndex = orderStatusHierarchy.indexOf(
    status?.toLowerCase() || ''
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

const NoOrderState = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 h-full">
        <Logo className="opacity-50" />
        <p className="text-muted-foreground">No orders yet</p>
    </div>
);


const RecentOrderCard = ({ order }: { order: Order }) => {
    const createdAt = (order.createdAt as unknown as Timestamp).toDate();
    
    const deliveryDurationMinutes = Math.floor(Math.random() * (45 - 25 + 1)) + 25;

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg border text-center">
            <h3 className="text-lg font-semibold">No Active Orders</h3>
            <p className="text-sm text-muted-foreground">Showing your most recent delivery.</p>
        </div>
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Order Date</span>
            <span className="font-medium">{format(createdAt, "PPP")}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize text-green-600">Delivered</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Delivery Time</span>
            <span className="font-medium">{deliveryDurationMinutes} minutes</span>
          </div>
        </div>
        <OrderSummaryCard items={order.items} />
      </div>
    )
}

export function TrackingSheet({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    setError(null);
    setActiveOrder(null);
    setRecentOrder(null);
    setEstimatedDeliveryTime(null);

    try {
      const ordersRef = collection(db, 'orders');
      
      // Simpler query: Get the last 5 orders for the user, sorted by creation date.
      const recentOrdersQuery = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(recentOrdersQuery);
      
      if (querySnapshot.empty) {
        setLoading(false);
        return;
      }

      const allRecentOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

      // Find the first order that is NOT delivered. This is our active order.
      const foundActiveOrder = allRecentOrders.find(order => order.status.toLowerCase() !== 'delivered');

      if (foundActiveOrder) {
        const createdAt = (foundActiveOrder.createdAt as Timestamp).toDate();
        const randomMinutes = Math.floor(Math.random() * (45 - 25 + 1)) + 25;
        const deliveryTime = new Date(createdAt.getTime() + randomMinutes * 60000);
        
        setEstimatedDeliveryTime(deliveryTime);
        setActiveOrder(foundActiveOrder);
      } else {
        // If no active order was found, the most recent one must be delivered.
        setRecentOrder(allRecentOrders[0]);
      }

    } catch (err: any) {
      console.error('Error fetching order:', err);
      if (err.code === 'failed-precondition') {
          setError('This query requires a Firestore index. Please create it in your Firebase console.');
      } else {
          setError('An error occurred while fetching your order. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (open && user) {
        fetchOrders(user.uid);
    } else if (open && !user) {
        setLoading(false);
        setActiveOrder(null);
        setRecentOrder(null);
    }
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
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="p-4 text-center text-red-500 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            ) : activeOrder ? (
              <>
                {estimatedDeliveryTime && activeOrder.status !== 'delivered' && (
                  <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center">
                    <p className="text-sm">Estimated Delivery</p>
                    <p className="text-2xl font-bold">
                      {format(estimatedDeliveryTime, 'hh:mm a')}
                    </p>
                  </div>
                )}
                <TrackingTimeline status={activeOrder.status} />
                <OrderSummaryCard items={activeOrder.items} />
              </>
            ) : recentOrder ? (
              <RecentOrderCard order={recentOrder} />
            ) : (
                <NoOrderState />
            )}
          </div>
        </main>
      </DrawerContent>
    </Drawer>
  );
}
