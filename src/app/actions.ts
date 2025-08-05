
"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { verifyPayment as verifyPaymentFlow, type VerifyPaymentInput, type VerifyPaymentOutput } from "@/ai/flows/verify-payment-flow";
import { chat as chatShoppingFlow, type ChatInput, type ChatOutput } from "@/ai/flows/chat-shopping";
import type { AIState, Product } from '@/lib/types';
import { getProducts } from "@/lib/products";
import Fuse from 'fuse.js';

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
    return await verifyPaymentFlow(input);
}

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

export async function continueConversation(history: AIState): Promise<AIState> {
    const lastMessage = history.slice(-1)[0];

    const chatInput: ChatInput = {
        message: lastMessage.content,
        photoDataUri: lastMessage.attachments?.find(a => a.contentType === 'image')?.url,
        history: history.slice(0, -1).map(h => ({
            role: h.role,
            parts: [{ text: h.content }],
        })),
    };
    
    try {
        const result = await chatShoppingFlow(chatInput);
        
        return [
            ...history,
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: result.response,
                products: result.products as Product[],
            },
        ];
    } catch (error: any) {
        console.error("Error in continueConversation:", error);
        const errorMessage = `An error occurred: ${error.message || 'Please try again.'}`;
        return [
            ...history,
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: errorMessage,
            },
        ];
    }
}
