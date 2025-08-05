
"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { AIState, Product } from '@/lib/types';

export async function cancelOrder(orderId: string): Promise<{ success: boolean, message: string }> {
    if (!orderId) {
        return { success: false, message: 'Order ID is required.' };
    }

    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'Cancelled',
            active: false
        });
        return { success: true, message: 'Your order has been cancelled.' };
    } catch (error: any) {
        console.error('Error cancelling order:', error);
        if (error.code === 'permission-denied') {
             return { success: false, message: 'You do not have permission to cancel this order, or it is past the cancellation window.' };
        }
        return { success: false, message: 'Failed to cancel the order. Please try again.' };
    }
}
