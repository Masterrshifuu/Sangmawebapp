

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoreStatus } from '@/lib/datetime';

export const DynamicDeliveryTime = ({ className }: { className?: string }) => {
    const [deliveryInfo, setDeliveryInfo] = useState({ text: '', isEstimate: false });
    
    useEffect(() => {
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
                         setDeliveryInfo({ text: `Delivery from ${format(firstDelivery, 'h:mm:ss a')}`, isEstimate: true });
                     } else {
                         setDeliveryInfo({ text: '', isEstimate: false });
                     }
                } else {
                    now.setMinutes(now.getMinutes() + 35);
                    setDeliveryInfo({ text: `Delivery by ${format(now, 'h:mm:ss a')}`, isEstimate: false });
                }
            } else {
                if (storeStatus.nextOpenTime) {
                    const firstDelivery = new Date(storeStatus.nextOpenTime);
                    firstDelivery.setMinutes(firstDelivery.getMinutes() + 35);
                    setDeliveryInfo({ text: `Delivery from ${format(firstDelivery, 'h:mm:ss a')}`, isEstimate: true });
                } else {
                    setDeliveryInfo({ text: '', isEstimate: false });
                }
            }
        };

        calculateDeliveryTime();
        const intervalId = setInterval(calculateDeliveryTime, 1000); // Update every second

        return () => clearInterval(intervalId);
    }, []);

    if (!deliveryInfo.text) {
        return null;
    }

    return (
        <div className={cn("flex items-center gap-2 text-sm", deliveryInfo.isEstimate ? "text-muted-foreground" : "text-[#5D4037] font-medium", className)}>
            <Clock className="w-4 h-4" />
            <span>{deliveryInfo.text}</span>
        </div>
    );
};
