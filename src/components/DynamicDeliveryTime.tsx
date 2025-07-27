
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DynamicDeliveryTime = ({ className }: { className?: string }) => {
    const [deliveryTime, setDeliveryTime] = useState('');
    const [isTomorrow, setIsTomorrow] = useState(false);
  
    useEffect(() => {
      const calculateDeliveryTime = () => {
        const now = new Date();
        const currentHour = now.getHours();

        // If it's 6 PM (18:00) or later
        if (currentHour >= 18) {
            setDeliveryTime('Tomorrow 9:30 am');
            setIsTomorrow(true);
        } else {
            now.setMinutes(now.getMinutes() + 35);
            setDeliveryTime(format(now, 'p')); // Formats to "4:30 PM"
            setIsTomorrow(false);
        }
      };
  
      calculateDeliveryTime();
      const intervalId = setInterval(calculateDeliveryTime, 60000); // Update every minute
  
      return () => clearInterval(intervalId);
    }, []);

    if (!deliveryTime) {
        return (
            <div className={cn("flex items-center gap-1 text-xs text-green-600 font-medium", className)}>
                <Clock className="w-3 h-3" />
                <span>Calculating...</span>
            </div>
        );
    }
  
    return (
      <div className={cn("flex items-center gap-2 text-green-600 font-medium", className)}>
        <Clock className="w-5 h-5" />
        <span>{isTomorrow ? deliveryTime : `Delivery by ${deliveryTime}`}</span>
      </div>
    );
};
