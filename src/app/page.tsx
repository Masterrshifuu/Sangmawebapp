
import HomeContent from '@/components/pages/home/HomeContent';
import { getAds } from '@/lib/ads';
import { getProducts } from '@/lib/products';
import { HomePageSkeleton } from '@/components/pages/home/HomePageSkeleton';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Fetch data on the server in parallel
  const [{ products, error: productsError }, { ads, error: adsError }] = await Promise.all([
    getProducts(),
    getAds()
  ]);

  // Handle potential errors during data fetching
  const error = productsError || adsError;
  if (error) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <pre className="text-left bg-gray-100 p-3 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      </div>
    );
  }

  // Initial loading state can be handled by loading.tsx, but this is a safety net
  if (!products || !ads) {
      return <HomePageSkeleton />;
  }

  const openTrackingSheet = searchParams?.from === 'checkout';

  return (
      <HomeContent 
        products={products} 
        ads={ads} 
        openTrackingSheetOnLoad={openTrackingSheet}
      />
  );
}
