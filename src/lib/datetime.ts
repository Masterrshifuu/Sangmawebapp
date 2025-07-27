
'use client';

type StoreStatus = {
    isOpen: boolean;
    message: string;
    nextOpenTime: Date | null;
};

/**
 * Checks if the store is currently open based on the day and time.
 * @returns {StoreStatus} An object containing the open status, a message, and the next opening time.
 */
export function getStoreStatus(): StoreStatus {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    
    const isSunday = day === 0;

    const getNextOpen = (openHour: number, openDayOffset: number = 0): Date => {
        const nextOpen = new Date(now);
        nextOpen.setDate(now.getDate() + openDayOffset);
        nextOpen.setHours(openHour, 0, 0, 0);
        return nextOpen;
    };

    if (isSunday) {
        // Sunday hours: 1:00 PM (13) to 6:00 PM (18)
        if (hours >= 13 && hours < 18) {
            return { isOpen: true, message: 'Store is open!', nextOpenTime: null };
        } else if (hours < 13) {
            return { 
                isOpen: false, 
                message: 'We open at 1:00 PM on Sundays. You can schedule your order for then.',
                nextOpenTime: getNextOpen(13)
            };
        } else { // hours >= 18
            return { 
                isOpen: false, 
                message: "We're closed for the day. We'll be open tomorrow from 9:00 AM.",
                nextOpenTime: getNextOpen(9, 1) // Next day is Monday
            };
        }
    } else {
        // Regular day hours: 9:00 AM (9) to 6:00 PM (18)
        if (hours >= 9 && hours < 18) {
            return { isOpen: true, message: 'Store is open!', nextOpenTime: null };
        } else if (hours < 9) {
            return { 
                isOpen: false, 
                message: 'We open at 9:00 AM. You can schedule your order for then.',
                nextOpenTime: getNextOpen(9)
            };
        } else { // hours >= 18
            const isSaturday = day === 6;
            const nextDayOpenHour = isSaturday ? 13 : 9; // Next day is Sunday
            const nextDayOpenTime = isSaturday ? '1:00 PM' : '9:00 AM';
            return { 
                isOpen: false, 
                message: `We're closed for the day. Would you like it delivered tomorrow starting from ${nextDayOpenTime}?`,
                nextOpenTime: getNextOpen(nextDayOpenHour, 1)
            };
        }
    }
}
