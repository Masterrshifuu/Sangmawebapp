'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { listenToUserOrders } from '@/lib/data-realtime';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusTracker from '@/components/order-status-tracker';
import AuthWrapper from '@/components/auth/auth-wrapper';
import BottomNavbar from '@/components/bottom-navbar';

function TrackOrderContent() {
  const { user, loading: authLoading } = useAuth();
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = listenToUserOrders(user.uid, (orders) => {
        if (orders.length > 0) {
          setLatestOrder(orders[0]); // Orders are sorted by date, so the first is the latest
        } else {
          setLatestOrder(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!latestOrder) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Track Order</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No orders found. Place an order to see its status here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Track Your Latest Order</CardTitle>
        <CardDescription>Order ID: {latestOrder.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <OrderStatusTracker status={latestOrder.status} />
      </CardContent>
    </Card>
  );
}

export default function TrackOrderPage() {
  return (
    <AuthWrapper>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <TrackOrderContent />
        </main>
        <Footer />
        <div className="md:hidden">
          <BottomNavbar />
        </div>
      </div>
    </AuthWrapper>
  );
}
