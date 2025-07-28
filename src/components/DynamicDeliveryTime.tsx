
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoreStatus } from '@/lib/datetime';
import { useLocation } from '@/hooks/use-location';

export const DynamicDeliveryTime = ({ className }: { className?: string }) => {
    const [deliveryInfo, setDeliveryInfo] = useState({ text: '', isEstimate: false });
    const { address } = useLocation();

    useEffect(() => {
        const calculateDeliveryTime = () => {
            const storeStatus = getStoreStatus();

            if (!address) {
                setDeliveryInfo({ text: 'Select a location', isEstimate: true });
                return;
            }

            if (storeStatus.isOpen) {
                const now = new Date();
                // If it's 6 PM (18:00) or later, show next day's delivery
                if (now.getHours() >= 18) {
                     const nextDayStatus = getStoreStatus(); // This will give next day's info
                     if (nextDayStatus.nextOpenTime) {
                         const firstDelivery = new Date(nextDayStatus.nextOpenTime);
                         firstDelivery.setMinutes(firstDelivery.getMinutes() + 35);
                         setDeliveryInfo({ text: `Delivery from ${format(firstDelivery, 'p')}`, isEstimate: true });
                     } else {
                         setDeliveryInfo({ text: '', isEstimate: false });
                     }
                } else {
                    now.setMinutes(now.getMinutes() + 35);
                    setDeliveryInfo({ text: `Delivery by ${format(now, 'p')}`, isEstimate: false });
                }
            } else {
                if (storeStatus.nextOpenTime) {
                    const firstDelivery = new Date(storeStatus.nextOpenTime);
                    firstDelivery.setMinutes(firstDelivery.getMinutes() + 35);
                    setDeliveryInfo({ text: `Delivery from ${format(firstDelivery, 'p')}`, isEstimate: true });
                } else {
                    setDeliveryInfo({ text: '', isEstimate: false });
                }
            }
        };

        calculateDeliveryTime();
        const intervalId = setInterval(calculateDeliveryTime, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, [address]);

    if (!deliveryInfo.text) {
        return null;
    }

    return (
        <div className={cn("flex items-center gap-2 text-sm", deliveryInfo.isEstimate ? "text-muted-foreground" : "text-green-600 font-medium", className)}>
            <Clock className="w-4 h-4" />
            <span>{deliveryInfo.text}</span>
        </div>
    );
};
