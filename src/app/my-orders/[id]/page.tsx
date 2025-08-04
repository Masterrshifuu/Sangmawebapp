
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import SearchHeader from '@/components/SearchHeader';
import { notFound } from 'next/navigation';
import { OrderCard } from '@/components/pages/my-orders/OrderCard';

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

async function getOrderById(id: string): Promise<Order | null> {
    try {
        const orderDocRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderDocRef);

        if (!orderSnap.exists()) {
            return null;
        }

        const data = orderSnap.data();
        const processedData = processTimestamps(data);

        return { id: orderSnap.id, ...processedData } as Order;

    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}


export default async function OrderDetailsPage({ params }: { params: { id: string }}) {
    const order = await getOrderById(params.id);

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
