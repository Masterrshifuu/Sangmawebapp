
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import SearchHeader from '@/components/SearchHeader';
import { notFound } from 'next/navigation';
import { OrderCard } from '@/components/pages/my-orders/OrderCard';
import { AlertTriangle } from 'lucide-react';

function processTimestamps(data: any): any {
    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(item => processTimestamps(item));
    }
    if (typeof data === 'object' && data !== null && !(data instanceof Timestamp)) {
        const newData: { [key: string]: any } = {};
        for (const key in data) {
            newData[key] = processTimestamps(data[key]);
        }
        return newData;
    }
    return data;
}

async function getOrderById(id: string): Promise<{ order: Order | null; error: string | null }> {
    try {
        const orderDocRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderDocRef);

        if (!orderSnap.exists()) {
            return { order: null, error: `Order with ID "${id}" could not be found.` };
        }

        const data = orderSnap.data();
        const processedData = processTimestamps(data);

        return { order: { id: orderSnap.id, ...processedData } as Order, error: null };

    } catch (error: any) {
        console.error("Error fetching order:", error);
        return { order: null, error: `Failed to fetch order: ${error.message}` };
    }
}

export default async function OrderDetailsPage({ params }: { params: { id: string }}) {
    const { order, error } = await getOrderById(params.id);

    if (error) {
        return (
            <>
                <SearchHeader />
                <main className="container mx-auto px-4 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Error Loading Order</h1>
                        <p className="text-muted-foreground">We encountered an issue trying to load this order's details.</p>
                        <div className="mt-4 p-4 bg-muted rounded-md text-left text-sm w-full max-w-2xl">
                            <p className="font-semibold">Error Details:</p>
                            <pre className="whitespace-pre-wrap font-mono text-destructive">{error}</pre>
                        </div>
                    </div>
                </main>
            </>
        );
    }
    
    if (!order) {
        notFound();
    }

    return (
        <>
            <SearchHeader />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-headline mb-6">Order Details</h1>
                <div className="max-w-2xl mx-auto">
                    <OrderCard order={order} onOrderCancel={() => {}} />
                </div>
            </main>
        </>
    );
}
