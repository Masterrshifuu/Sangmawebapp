'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OrderStatusTracker from "@/components/order-status-tracker";
import { useEffect, useState } from "react";
import { listenToUserOrders } from "@/lib/data-realtime";
import { useAuth } from "@/hooks/use-auth";
import type { Order } from "@/lib/types";
import { Loader2, ShoppingBag } from "lucide-react";
import AuthWrapper from "@/components/auth/auth-wrapper";

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
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
        <ShoppingBag className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No Orders Yet</h3>
        <p className="text-sm">Place an order to see its status here.</p>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Track Your Latest Order</CardTitle>
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
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-250px)]">
        <TrackOrderContent />
      </div>
    </AuthWrapper>
  );
}
