
'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import { getHomePageData } from '@/lib/home';
import { CategoryShowcase } from '@/components/category/CategoryShowcase';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAds } from '@/hooks/use-ads';
import { AdCard } from '@/components/AdCard';
import type { Ad, Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';

// Helper function to shuffle an array
function shuffle<T>(array: T[]): T[] {
  if (!array) return [];
  const newArray = [...array];
  let currentIndex = newArray.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }
  return newArray;
}

const HomePageSkeleton = () => (
    <>
        <Header />
        <main className="flex-1 pb-16 md:pb-0 py-6 space-y-8">
            {/* Category Showcase Skeleton */}
            <section>
                <Skeleton className="h-8 w-48 mb-4 ml-4" />
                <div className="flex gap-4 overflow-x-auto pb-4 px-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center space-y-2 flex-shrink-0">
                            <Skeleton className="w-20 h-20 rounded-lg" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </section>

             {/* Product Grid Skeleton */}
            <section className="px-4">
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                       <Skeleton key={i} className="w-full aspect-[4/5] rounded-lg" />
                    ))}
                </div>
            </section>
        </main>
    </>
);


export default function Home() {
  const { products, error, loading } = useProducts();
  const { ads, loading: adsLoading } = useAds();
  
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);
  const [shuffledAds, setShuffledAds] = useState<Ad[]>([]);

  const homePageData = useMemo(() => {
    if (products.length > 0) {
      return getHomePageData(products);
    }
    return null;
  }, [products]);

  useEffect(() => {
    if (products.length > 0) {
        setShuffledProducts(shuffle(products));
    }
    if (ads.length > 0) {
        setShuffledAds(shuffle(ads));
    }
  }, [products, ads]);

  // Interleave ads with products
  const interleavedContent = useMemo(() => {
    const content: (Product | Ad)[] = [...shuffledProducts];
    if (shuffledAds.length > 0) {
        let adIndex = 0;
        // Insert an ad after every 6 products
        for (let i = 6; i < content.length; i += 7) {
            if (adIndex < shuffledAds.length) {
                content.splice(i, 0, shuffledAds[adIndex]);
                adIndex++;
            }
        }
    }
    return content;
  }, [shuffledProducts, shuffledAds]);


  if (loading || adsLoading) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Firestore Access Error</h2>
          <pre className="text-left bg-gray-100 p-3 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="p-4 text-center text-muted-foreground">
             <h2 className="text-2xl font-bold text-foreground mb-2">No Products Found</h2>
             <p>It looks like there are no products in the database yet.</p>
             <p className="mt-4 text-xs">If you have already configured your Firebase project, please add some products to the 'products' collection in Firestore.</p>
          </div>
        </main>
      </>
    )
  }

  if (!homePageData) {
    return <HomePageSkeleton />;
  }
  
  const { showcaseCategories } = homePageData;

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
         <section className="py-6">
            <div className="container mx-auto px-4 mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold font-headline">Shop by Category</h2>
                <Link href="/categories" className="text-sm font-medium text-accent-foreground hover:underline">
                    View All &gt;
                </Link>
            </div>
            {showcaseCategories.length > 0 && (
                <CategoryShowcase 
                    showcaseCategories={showcaseCategories} 
                />
            )}
        </section>

        <section className="py-4">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold font-headline mb-4">Just for You</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {interleavedContent.map((item, index) => {
                        if ('mediaType' in item) { // This is an Ad
                            return <AdCard key={(item as Ad).id || `ad-${index}`} ad={item as Ad} className="col-span-2 aspect-[2/1] md:aspect-[3/1]" />;
                        } else { // This is a Product
                            return <ProductCard key={(item as Product).id} product={item as Product} />;
                        }
                    })}
                </div>
            </div>
        </section>

      </main>
    </>
  );
}
