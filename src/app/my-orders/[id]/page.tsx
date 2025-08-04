
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import Header from '@/components/header';
import { notFound } from 'next/navigation';
import { OrderCard } from '@/components/pages/my-orders/OrderCard';

async function getOrderById(id: string): Promise<Order | null> {
    try {
        const orderDocRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderDocRef);

        if (!orderSnap.exists()) {
            return null;
        }

        const data = orderSnap.data();
        // Convert any Firestore Timestamps to serializable ISO strings
        for (const key in data) {
            const value = data[key];
            if (value && typeof value.toDate === 'function') {
                data[key] = value.toDate().toISOString();
            }
        }

        return { id: orderSnap.id, ...data } as Order;

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

    const handleOrderCancellation = (cancelledOrderId: string) => {
        // This function is passed to satisfy the component prop,
        // but on the details page, a reload would show the updated status.
        console.log(`Order ${cancelledOrderId} cancellation handled.`);
    };

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-headline mb-6">Order Details</h1>
                <div className="max-w-2xl mx-auto">
                    <OrderCard order={order} onOrderCancel={handleOrderCancellation} />
                </div>
            </main>
        </>
    );
}
