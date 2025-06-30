import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OrderStatusTracker from "@/components/order-status-tracker";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order - Sangma Megha Mart',
  description: 'Track your order status.',
};

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-250px)]">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Track Your Order</CardTitle>
          <CardDescription>Order ID: #SMM123456789</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderStatusTracker currentStep={2} />
        </CardContent>
      </Card>
    </div>
  );
}
