
'use client';

type StoreStatus = {
    isOpen: boolean;
    message: string;
};

/**
 * Checks if the store is currently open based on the day and time.
 * @returns {StoreStatus} An object containing the open status and a message.
 */
export function getStoreStatus(): StoreStatus {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    
    const isSunday = day === 0;

    if (isSunday) {
        // Sunday hours: 1:00 PM (13) to 6:00 PM (18)
        if (hours >= 13 && hours < 18) {
            return { isOpen: true, message: 'Store is open!' };
        } else if (hours < 13) {
            return { isOpen: false, message: 'We open at 1:00 PM on Sundays. You can place your order then.' };
        } else { // hours >= 18
            return { isOpen: false, message: "We're closed for the day. We'll be open tomorrow from 9:00 AM." };
        }
    } else {
        // Regular day hours: 9:00 AM (9) to 6:00 PM (18)
        if (hours >= 9 && hours < 18) {
            return { isOpen: true, message: 'Store is open!' };
        } else if (hours < 9) {
            return { isOpen: false, message: 'We open at 9:00 AM. You can place your order then.' };
        } else { // hours >= 18
            const nextDayIsSunday = day === 6;
            const nextDayOpenTime = nextDayIsSunday ? '1:00 PM' : '9:00 AM';
            return { isOpen: false, message: `We're closed for the day. Would you like it delivered tomorrow starting from ${nextDayOpenTime}?` };
        }
    }
}
