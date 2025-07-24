
'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import { BestsellerCard } from '@/components/BestsellerCard';
import { getHomePageData } from '@/lib/home';
import { CategoryShowcase } from '@/components/category/CategoryShowcase';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { HorizontalScroller } from '@/components/horizontal-scroller';
import { CarouselItem } from '@/components/ui/carousel';
import { useAds } from '@/hooks/use-ads';
import { AdCard } from '@/components/AdCard';
import type { Ad } from '@/lib/types';
import { CategoryPreviewCard } from '@/components/category/CategoryPreviewCard';

// Helper function to shuffle an array
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  let currentIndex = newArray.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

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

            {/* Bestsellers Skeleton */}
            <section>
                <Skeleton className="h-8 w-40 mb-4 ml-4" />
                <div className="grid grid-cols-2 gap-4 px-4">
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <Skeleton className="w-full aspect-square rounded-lg" />
                </div>
            </section>

             {/* Product Grid Skeleton */}
            <section>
                <Skeleton className="h-8 w-32 mb-4 ml-4" />
                <div className="flex gap-4 px-4">
                    {[...Array(2)].map((_, i) => (
                       <Skeleton key={i} className="w-80 h-80 rounded-lg flex-shrink-0" />
                    ))}
                </div>
            </section>
        </main>
    </>
);


export default function Home() {
  const { products, error, loading } = useProducts();
  const { ads, loading: adsLoading } = useAds();
  const [shuffledAds, setShuffledAds] = useState<Ad[]>([]);

  const homePageData = useMemo(() => {
    if (products.length > 0) {
      return getHomePageData(products);
    }
    return null;
  }, [products]);

  useEffect(() => {
    if (ads.length > 0) {
        setShuffledAds(shuffle(ads));
    }
  }, [ads]);

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
  
  const { productsByCategory, showcaseCategories, bestsellerCategories, previewCategories } = homePageData;
  
  const nonBestsellerPreviewCategories = previewCategories.filter(
      pCat => !bestsellerCategories.some(bCat => bCat.name === pCat.name)
  );
  
  const interleavedContent = [];
  let adIndex = 0;
  
  if (nonBestsellerPreviewCategories.length > 0) {
      interleavedContent.push({type: 'preview', data: nonBestsellerPreviewCategories});
  }

  // Insert an ad after the main category previews, if ads are available
  if (shuffledAds.length > 0) {
      interleavedContent.push({type: 'ad', data: shuffledAds[adIndex]});
      adIndex++;
  }


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

        {bestsellerCategories.length > 0 && (
          <section className="py-4">
             <div className="container mx-auto px-4 mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold font-headline">Bestsellers</h2>
             </div>
             <HorizontalScroller>
                {bestsellerCategories.map((category) => (
                    <CarouselItem key={category.name} className="basis-11/12 md:basis-1/2 lg:basis-1/3">
                        <BestsellerCard category={category} />
                    </CarouselItem>
                ))}
             </HorizontalScroller>
          </section>
        )}

        {interleavedContent.map((item, index) => {
            if (item.type === 'preview') {
                const categories = item.data as typeof previewCategories;
                return (
                    <section key={`preview-section-${index}`} className="py-4">
                        <HorizontalScroller>
                           {categories.map((category) => (
                                <CarouselItem key={category.name} className="basis-11/12 md:basis-1/2 lg:basis-1/3">
                                    <CategoryPreviewCard category={category} />
                                </CarouselItem>
                            ))}
                        </HorizontalScroller>
                    </section>
                )
            } else if (item.type === 'ad') { 
                return <AdCard key={(item.data as Ad).id || `ad-${index}`} ad={item.data as Ad} />
            }
            return null;
        })}

      </main>
    </>
  );
}
