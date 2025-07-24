
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  MapPin,
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
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

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

const NoOrderState = () => {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }
  
    const position: [number, number] = [25.5159, 90.2201]; // Tura coordinates
  
    return (
        <div className="h-[calc(80vh-150px)] w-full flex flex-col">
            <div className="p-4 text-center">
                <h3 className="font-bold text-lg">No Active Orders</h3>
                <p className="text-muted-foreground text-sm">When you place an order, you can track it here.</p>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden border">
                <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="w-full h-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}></Marker>
                </MapContainer>
            </div>
        </div>
    );
};


export function TrackingSheet({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
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

  const fetchMostRecentOrder = async (userId: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    setEstimatedDeliveryTime(null);

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        where('status', '!=', 'delivered'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();
        const createdAt = (orderData.createdAt as Timestamp).toDate();

        const randomMinutes = Math.floor(Math.random() * (45 - 25 + 1)) + 25;
        const deliveryTime = new Date(createdAt.getTime() + randomMinutes * 60000);
        setEstimatedDeliveryTime(deliveryTime);

        setOrder({ id: orderDoc.id, ...orderData } as Order);
      } else {
        setOrder(null); // No active orders found
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
  
  // Fetch order when sheet opens and user is available
  useEffect(() => {
    if (open && user) {
        fetchMostRecentOrder(user.uid);
    } else if (open && !user) {
        setLoading(false);
        setOrder(null);
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
            ) : order ? (
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
            ) : (
                <NoOrderState />
            )}
          </div>
        </main>
      </DrawerContent>
    </Drawer>
  );
}
