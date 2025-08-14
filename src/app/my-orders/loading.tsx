
import { SearchHeader } from '@/components/SearchHeader';
import { OrdersSkeleton } from '@/components/pages/my-orders/OrdersSkeleton';

export default function Loading() {
  return (
    <>
      <SearchHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-6">My Orders</h1>
        <OrdersSkeleton />
      </main>
    </>
  );
}
