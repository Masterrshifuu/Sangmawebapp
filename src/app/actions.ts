
"use server";

import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import Fuse from 'fuse.js';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

// This is a new type to handle the optional product context in chat history
type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    products?: Product[];
    productContext?: { name: string; description: string };
};

export async function cancelOrder(orderId: string): Promise<{ success: boolean, message: string }> {
    if (!orderId) {
        return { success: false, message: 'Order ID is required.' };
    }

    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'Cancelled',
            cancelledAt: serverTimestamp(),
            // 'active' is now managed by a Cloud Function or manually by staff
            // to prevent violating security rules.
        });
        return { success: true, message: 'Order has been cancelled.' };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return { success: false, message: 'Failed to cancel the order. Please check permissions or try again.' };
    }
}
