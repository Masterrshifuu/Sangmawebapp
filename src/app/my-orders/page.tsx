
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/lib/types';
import Header from '@/components/header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageOpen } from 'lucide-react';
import { OrdersSkeleton } from '@/components/pages/my-orders/OrdersSkeleton';
import { OrderCard } from '@/components/pages/my-orders/OrderCard';

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
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
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

  const handleOrderCancellation = (cancelledOrderId: string) => {
    setOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === cancelledOrderId 
                ? { ...order, status: 'Cancelled', active: false } 
                : order
        )
    );
  };

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
              <OrderCard key={order.id} order={order} onOrderCancel={handleOrderCancellation} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
