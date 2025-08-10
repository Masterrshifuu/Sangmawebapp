'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
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
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  Timestamp,
  query,
  where,
  onSnapshot,
  writeBatch,
  doc,
} from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/types';
import { format, addMinutes, differenceInMinutes, formatRelative } from 'date-fns';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Logo from '../logo';
import { DynamicDeliveryTime } from '../DynamicDeliveryTime';
import { cancelOrder } from '@/app/actions';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getStoreStatus } from '@/lib/datetime';
import { Separator } from '../ui/separator';

const OrderSummaryCard = ({ items, orderId }: { items: OrderItem[], orderId: string }) => {
  const firstItem = items[0];
  const remainingItemsCount = items.length - 1;

  if (!firstItem) return null;

  return (
    <Link href={`/my-orders/${orderId}`}>
      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors">
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
    </Link>
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
            <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-semibold">Order Scheduled</h3>
            </div>
            <p className="text-sm mt-1">Your order will be processed when the store opens.</p>
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

const OrderStatusCard = ({ order }: { order: Order}) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [eta, setEta] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const getSafeDate = (dateValue: any): Date => {
      if (!dateValue) return new Date();
      if (typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
      }
      return new Date(dateValue);
    };

    const calculateTimeLeft = useCallback(() => {
        if (!order.createdAt) {
          setTimeLeft('Calculating...');
          setEta('');
          return;
        };

        const orderTime = getSafeDate(order.createdAt);
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
        if (order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Scheduled') {
            return;
        }
        calculateTimeLeft();
        const intervalId = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(intervalId);
    }, [calculateTimeLeft, order.status]);

    const isCancellable = () => {
        if (!order.createdAt) return false;
        const createdAt = getSafeDate(order.createdAt);
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
        const createdAt = getSafeDate(order.createdAt);
        const deliveredAt = getSafeDate(order.cancelledAt) || new Date(); 
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

     if (order.status === 'Scheduled') {
        const storeStatus = getStoreStatus();
        const nextOpenTimeFormatted = storeStatus.nextOpenTime 
            ? formatRelative(storeStatus.nextOpenTime, new Date())
                .replace(/^./, (c) => c.toUpperCase())
            : 'next opening';

        return (
            <div className="p-4 rounded-lg bg-purple-100 text-purple-800 text-center space-y-1">
                <p className="text-sm font-semibold flex items-center justify-center gap-2"><Clock />Order Scheduled</p>
                <p className="text-lg font-bold">Will be delivered on next opening.</p>
                <p className="text-xs pt-1">Shop opens: {nextOpenTimeFormatted}</p>
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

const LoggedInView = ({ user }: { user: User }) => {
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
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
            const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            fetchedOrders.sort((a, b) => {
                const dateA = (a.createdAt as unknown as Timestamp)?.toDate() || new Date();
                const dateB = (b.createdAt as unknown as Timestamp)?.toDate() || new Date();
                return dateB.getTime() - dateA.getTime();
            });
            setActiveOrders(fetchedOrders);
            setLoading(false);
        }, (err) => {
            console.error('Error with real-time order listener:', err);
            setError('An error occurred while tracking your order.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center p-8 space-y-4">
                <Logo className="animate-pulse" />
                <p className="text-muted-foreground text-sm">Finding your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return activeOrders.length > 0 ? (
        activeOrders.map((order, index) => (
            <div key={order.id} className="space-y-4">
                {index > 0 && <Separator className="my-6" />}
                <OrderStatusCard order={order} />
                <TrackingTimeline status={order.status} />
                <OrderSummaryCard items={order.items} orderId={order.id} />
            </div>
        ))
    ) : (
        <NoActiveOrderCard />
    );
};

const LoggedOutView = ({ onLoginClick }: { onLoginClick: () => void }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
        <Truck className="w-16 h-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Track Your Order</h3>
        <p className="text-sm text-muted-foreground">Log in to see the status of your active orders.</p>
        <Button onClick={onLoginClick}>
            <LogIn className="mr-2 h-4 w-4" />
            Login / Sign Up
        </Button>
    </div>
);


const TrackingContent = ({ onLoginClick, isOpen }: { onLoginClick: () => void, isOpen: boolean }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

     // Effect to mark orders as viewed when the sheet is opened
    useEffect(() => {
        if (isOpen && user) {
            const markOrdersAsViewed = async () => {
                const ordersRef = collection(db, 'orders');
                const q = query(
                    ordersRef,
                    where('userId', '==', user.uid),
                    where('active', '==', true),
                    where('viewedByCustomer', '==', false)
                );
                
                try {
                    const querySnapshot = await onSnapshot(q, (snapshot) => {
                        if (!snapshot.empty) {
                            const batch = writeBatch(db);
                            snapshot.docs.forEach((docSnapshot) => {
                                const orderDocRef = doc(db, 'orders', docSnapshot.id);
                                batch.update(orderDocRef, { viewedByCustomer: true });
                            });
                            batch.commit().catch(err => console.error("Failed to mark orders as viewed:", err));
                        }
                    });
                     // Detach listener immediately after first execution to avoid infinite loops
                    // return () => query(); // This is incorrect, you should return the unsubscribe function from onSnapshot if you want to detach the listener. However, for this specific case, you likely don't need a persistent listener here, just a one-time fetch when the sheet opens. Let's change this to a getDocs call.
                } catch (err) {
                    console.error("Error querying unread orders:", err);
                }
            };

            markOrdersAsViewed();
        }
    }, [isOpen, user]);

    return (
        <div className="p-4 space-y-6">
            {loading ? (
                <div className="flex flex-col justify-center items-center p-8 space-y-4">
                    <Logo className="animate-pulse" />
                </div>
            ) : user ? (
                <LoggedInView user={user} />
            ) : (
                <LoggedOutView onLoginClick={onLoginClick} />
            )}
        </div>
    )
}


export function TrackingSheet({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children?: React.ReactNode }) {
    const router = useRouter();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const handleLoginRedirect = () => {
        onOpenChange(false); // Close the sheet before navigating
        router.push('/login');
    };
    
    // The component can now be controlled from the outside.
    // If `children` are provided, it will render a trigger. Otherwise, it won't.

    const SheetComponent = isDesktop ? Sheet : Drawer;
    const SheetContentComponent = isDesktop ? SheetContent : DrawerContent;
    const Trigger = children ? (isDesktop ? SheetTrigger : DrawerTrigger) : React.Fragment;

    return (
        <SheetComponent open={open} onOpenChange={onOpenChange}>
            {children && <Trigger asChild>{children}</Trigger>}
            <SheetContentComponent 
                {...(isDesktop ? 
                    { size: 'sm', className: "p-0 flex flex-col" } : 
                    { className: "h-[85vh] flex flex-col p-0" }
                )}
            >
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>{isDesktop ? 'Track Your Order' : 
                    <div className="text-center flex items-center justify-between">
                         <DrawerClose asChild>
                            <Button variant="ghost" size="icon">
                                <ChevronLeft />
                                <span className="sr-only">Back</span>
                            </Button>
                        </DrawerClose>
                        <span className="flex-1 text-center">
                            Track Your Order
                        </span>
                        <div className="w-10" />
                    </div>
                    }</SheetTitle>
                </SheetHeader>
                <main className="flex-1 overflow-y-auto">
                    <TrackingContent onLoginClick={handleLoginRedirect} isOpen={open} />
                </main>
            </SheetContentComponent>
        </SheetComponent>
    );
}
