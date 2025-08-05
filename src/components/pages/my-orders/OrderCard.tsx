
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { XCircle } from 'lucide-react';

import type { Order } from '@/lib/types';
import { cn } from '@/lib/utils';
import { cancelOrder } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getStoreStatus } from '@/lib/datetime';
import { Separator } from '@/components/ui/separator';

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
  

export const OrderCard = ({ order, onOrderCancel }: { order: Order; onOrderCancel: (orderId: string) => void; }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const { user } = useAuth();
  
  const getSafeDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    // Check if it's a Firestore Timestamp
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    // Assume it's an ISO string or already a Date object
    return new Date(dateValue);
  };

  const createdAt = getSafeDate(order.createdAt);
  const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;
  const status = order.status || 'Pending';
  
  const subtotal = useMemo(() => {
    if (order.subtotal !== undefined) return order.subtotal;
    // Fallback calculation if subtotal is not stored in the order
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [order.items, order.subtotal]);

  const deliveryCharge = useMemo(() => {
    if (order.deliveryCharge !== undefined) return order.deliveryCharge;
    // Fallback calculation
    return totalAmount - subtotal;
  }, [order.deliveryCharge, totalAmount, subtotal]);

  const isCancellable = () => {
    if (!user) return false;
    const now = new Date();
    const orderTime = getSafeDate(order.createdAt);

    if (order.status === 'Scheduled') {
        const storeStatus = getStoreStatus();
        // Allow cancellation if the order is scheduled and the store is not yet open
        return storeStatus.nextOpenTime ? now < storeStatus.nextOpenTime : false;
    }

    const minutesSinceOrder = (now.getTime() - orderTime.getTime()) / (1000 * 60);
    const cancellableStatuses = ['pending', 'confirmed', 'packed'];
    return minutesSinceOrder < 5 && cancellableStatuses.includes(status.toLowerCase().replace(/ /g, '_'));
  };

  const handleCancelOrder = async () => {
    if (!order.id || !isCancellable()) return;
    setIsCancelling(true);
    const result = await cancelOrder(order.id);
    if (result.success) {
        onOrderCancel(order.id); // Notify parent to update the list
    } else {
        console.error("Cancellation Failed:", result.message);
    }
    setIsCancelling(false);
  };

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
            <p className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="p-4 bg-muted/30 rounded-b-lg space-y-4">
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}</span>
            </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
            <p className="text-base font-semibold">Total: ₹{totalAmount.toFixed(2)}</p>
            <div>
                {isCancellable() ? (
                    <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                ) : (
                    <Button size="sm" variant="outline" asChild>
                        <Link href={`/my-orders/${order.id}`}>View Details</Link>
                    </Button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
