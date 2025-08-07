

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoreStatus } from '@/lib/datetime';

export const DynamicDeliveryTime = ({ className }: { className?: string }) => {
    const [deliveryInfo, setDeliveryInfo] = useState({ text: 'Calculating...', isEstimate: false, isOpen: true });
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const calculateDeliveryTime = () => {
            const storeStatus = getStoreStatus();

            if (storeStatus.isOpen) {
                const now = new Date();
                // If it's 6 PM (18:00) or later, show next day's delivery
                if (now.getHours() >= 18) {
                     const nextDayStatus = getStoreStatus(); // This will give next day's info
                     if (nextDayStatus.nextOpenTime) {
                         const firstDelivery = new Date(nextDayStatus.nextOpenTime);
                         firstDelivery.setMinutes(firstDelivery.getMinutes() + 35);
                         setDeliveryInfo({ text: `Delivery from ${format(firstDelivery, 'h:mm a')}`, isEstimate: true, isOpen: false });
                     } else {
                         setDeliveryInfo({ text: '', isEstimate: false, isOpen: false });
                     }
                } else {
                    now.setMinutes(now.getMinutes() + 35);
                    setDeliveryInfo({ text: `Delivery by ${format(now, 'h:mm a')}`, isEstimate: false, isOpen: true });
                }
            } else {
                if (storeStatus.nextOpenTime) {
                    const firstDelivery = new Date(storeStatus.nextOpenTime);
                    firstDelivery.setMinutes(firstDelivery.getMinutes() + 35);
                    setDeliveryInfo({ text: `Delivery from ${format(firstDelivery, 'h:mm a')}`, isEstimate: true, isOpen: false });
                } else {
                    setDeliveryInfo({ text: '', isEstimate: false, isOpen: false });
                }
            }
        };

        calculateDeliveryTime();
        const intervalId = setInterval(calculateDeliveryTime, 1000 * 60); // Update every minute

        return () => clearInterval(intervalId);
    }, [isClient]);

    if (!deliveryInfo.text) {
        return null;
    }

    const isCalculating = deliveryInfo.text === 'Calculating...';

    return (
        <div className={cn(
            "flex items-center gap-1 text-sm",
            isCalculating ? "text-muted-foreground" : (deliveryInfo.isOpen ? "text-muted-foreground" : "text-destructive"),
            className
        )}>
            {isCalculating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Clock className="w-4 h-4" />
            )}
            <span>{deliveryInfo.text}</span>
        </div>
    );
};
