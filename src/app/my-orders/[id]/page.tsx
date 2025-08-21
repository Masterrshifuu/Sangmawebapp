'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, Timestamp, onSnapshot, type DocumentSnapshot } from 'firebase/firestore'; // Added onSnapshot and DocumentSnapshot
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import { SearchHeader } from '@/components/SearchHeader';
import { notFound, useParams } from 'next/navigation';
import { OrderCard } from '@/components/pages/my-orders/OrderCard';
import { AlertTriangle } from 'lucide-react';
import Loading from './loading';
import { useAuth } from '@/hooks/use-auth';

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

export default function OrderDetailsPage() {
    const params = useParams();
    const { user, loading: authLoading } = useAuth();
    const id = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setError("You must be logged in to view this page.");
            setLoading(false);
            return;
        }
        if (!id) {
            setError("Order ID is missing.");
            setLoading(false);
            return;
        }

        const orderDocRef = doc(db, 'orders', id);

        const unsubscribe = onSnapshot(orderDocRef, (orderSnap: DocumentSnapshot) => { // Typed orderSnap
            setLoading(true);
            try {
                if (!orderSnap.exists()) {
                    setError(`Order with ID "${id}" could not be found.`);
                    setOrder(null);
                    setLoading(false);
                    return;
                }

                const data = orderSnap.data();

                // Security check: ensure the fetched order belongs to the current user
                if (data.userId !== user.uid) {
                    setError("You do not have permission to view this order.");
                    setOrder(null);
                    setLoading(false);
                    return;
                }

                const processedData = processTimestamps(data);
                setOrder({ id: orderSnap.id, ...processedData } as Order);
                setError(null);
            } catch (err: any) {
                console.error("Error fetching order:", err);
                setError(`Failed to fetch order: ${err.message}`);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        });

        // Unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    }, [id, user, authLoading]);

    if (loading || authLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <>
                <SearchHeader />
                <main className="container mx-auto px-4 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Error Loading Order</h1>
                        <p className="text-muted-foreground">We encountered an issue trying to load this order&apos;s details.</p>
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
                    <OrderCard order={order} onOrderCancel={() => {
                        // Refresh or update state after cancellation
                        setOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                    }} />
                </div>
            </main>
        </>
    );
}