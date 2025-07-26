
import { db } from './firebase';
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    type Timestamp
} from 'firebase/firestore';
import type { OrderTimer } from './types';

// Helper to convert Firestore Timestamps in nested objects
function processDoc(doc: any): OrderTimer | null {
    if (!doc.exists()) {
        return null;
    }
    const data = doc.data();
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return {
        id: doc.id,
        ...data
    } as OrderTimer;
}

/**
 * Creates a new timer document in the 'Estimated Timer' collection for a given order.
 * @param orderId - The ID of the order.
 * @param userId - The ID of the user who placed the order.
 * @returns The ID of the newly created timer document.
 */
export async function createOrderTimer(orderId: string, userId: string): Promise<string> {
    try {
        const timerRef = doc(db, 'Estimated Timer', orderId);
        const newTimer: OrderTimer = {
            orderId,
            userId,
            orderTime: serverTimestamp(),
            estimatedDeliveryTime: 35, // Initial countdown in minutes
            extraTime: 0,
            finalETA: 35
        };
        await setDoc(timerRef, newTimer);
        return timerRef.id;
    } catch (error) {
        console.error("Error creating order timer:", error);
        throw new Error("Could not create order timer.");
    }
}

/**
 * Fetches the timer document for a specific order.
 * @param orderId - The ID of the order.
 * @returns The OrderTimer object or null if not found.
 */
export async function getOrderTimer(orderId: string): Promise<OrderTimer | null> {
    try {
        const timerRef = doc(db, 'Estimated Timer', orderId);
        const docSnap = await getDoc(timerRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as OrderTimer;
        }
        return null;
    } catch (error) {
        console.error("Error fetching order timer:", error);
        return null;
    }
}

/**
 * Updates the extra time for an order's timer.
 * This would typically be called from a delivery person's interface.
 * @param orderId - The ID of the order to update.
 * @param extraTime - The additional time in minutes to add.
 */
export async function addExtraTimeToOrder(orderId: string, extraTime: number): Promise<void> {
    try {
        const timerRef = doc(db, 'Estimated Timer', orderId);
        const docSnap = await getDoc(timerRef);

        if (!docSnap.exists()) {
            throw new Error("Timer for this order does not exist.");
        }

        const currentTimer = docSnap.data() as OrderTimer;
        const newExtraTime = (currentTimer.extraTime || 0) + extraTime;
        const newFinalETA = currentTimer.estimatedDeliveryTime + newExtraTime;

        await setDoc(timerRef, { 
            extraTime: newExtraTime,
            finalETA: newFinalETA,
        }, { merge: true });

    } catch (error) {
        console.error("Error adding extra time to order:", error);
        throw new Error("Could not update order timer.");
    }
}
