
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/lib/types';
import Header from '@/components/header';
import Image from 'next/image';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusStyles: { [key: string]: string } = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-blue-100 text-blue-800',
    packed: 'bg-yellow-100 text-yellow-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-purple-100 text-purple-800',
  };
  

const OrderCard = ({ order }: { order: Order }) => {
  const createdAt = (order.createdAt as unknown as Timestamp).toDate();
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;
  const status = order.status || 'Pending';

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-sm">Order #{order.id?.substring(0, 8)}</p>
            <p className="text-xs text-muted-foreground">{format(createdAt, 'PPP, p')}</p>
          </div>
          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', statusStyles[status.toLowerCase().replace(/ /g, '_')] || 'bg-gray-100 text-gray-800')}>
            {status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>
      <div className="p-4">
        {order.items.map((item, index) => (
          <div key={item.id + index} className="flex items-center gap-4 mb-3 last:mb-0">
            <Link href={`/product/${item.id}`}>
                <div className="relative w-14 h-14 bg-muted/30 rounded-md overflow-hidden">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-contain" sizes="15vw" />
                </div>
            </Link>
            <div className="flex-1">
              <Link href={`/product/${item.id}`}>
                <p className="text-sm font-medium leading-tight hover:underline">{item.name}</p>
              </Link>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium">INR {(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="p-4 bg-muted/30 rounded-b-lg flex justify-between items-center">
        <p className="text-sm font-semibold">Total: INR {totalAmount.toFixed(2)}</p>
        <Button size="sm" variant="outline" asChild>
            <Link href="#">View Details</Link>
        </Button>
      </div>
    </div>
  );
};

const OrdersSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border">
                <div className="p-4 border-b">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex gap-4">
                        <Skeleton className="h-14 w-14 rounded-md" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                     <div className="flex gap-4">
                        <Skeleton className="h-14 w-14 rounded-md" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
)

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const ordersRef = collection(db, 'orders');
        // Query only by userId to avoid needing a composite index
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        // Sort the orders by date on the client-side
        const sortedOrders = fetchedOrders.sort((a, b) => {
            const dateA = (a.createdAt as unknown as Timestamp).toDate();
            const dateB = (b.createdAt as unknown as Timestamp).toDate();
            return dateB.getTime() - dateA.getTime();
        });

        setOrders(sortedOrders);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-6">My Orders</h1>

        {loading && <OrdersSkeleton />}
        
        {error && (
            <div className="p-4 text-center text-red-500 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <PackageOpen className="mx-auto h-16 w-16 mb-4" />
            <h2 className="text-xl font-semibold text-foreground">No Orders Yet</h2>
            <p>You haven't placed any orders with us. Start shopping!</p>
            <Button asChild className="mt-6">
                <Link href="/">Shop Now</Link>
            </Button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
