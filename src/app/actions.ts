
"use server";

import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import Fuse from 'fuse.js';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { verifyPayment as verifyPaymentFlow, type VerifyPaymentInput, type VerifyPaymentOutput } from "@/ai/flows/verify-payment-flow";


// This is a new type to handle the optional product context in chat history
type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    products?: Product[];
    productContext?: { name: string; description: string };
};

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
    return await verifyPaymentFlow(input);
}

export async function cancelOrder(orderId: string): Promise<{ success: boolean, message: string }> {
    if (!orderId) {
        return { success: false, message: 'Order ID is required.' };
    }

    try {
        const orderRef = doc(db, 'orders', orderId);
        // This update is restricted by security rules to only allow changing the status to 'Cancelled'.
        // Other fields like 'active' or 'cancelledAt' must be handled by a backend process or admin.
        await updateDoc(orderRef, {
            status: 'Cancelled',
        });
        return { success: true, message: 'Your order has been cancelled.' };
    } catch (error: any) {
        console.error('Error cancelling order:', error);
        // Provide a more user-friendly message in case of permission errors
        if (error.code === 'permission-denied') {
             return { success: false, message: 'You do not have permission to cancel this order, or it is past the cancellation window.' };
        }
        return { success: false, message: 'Failed to cancel the order. Please try again.' };
    }
}
