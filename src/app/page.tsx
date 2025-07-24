
'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import { getHomePageData } from '@/lib/home';
import { CategoryShowcase } from '@/components/category/CategoryShowcase';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { HorizontalScroller } from '@/components/horizontal-scroller';
import { BestsellerCard } from '@/components/BestsellerCard';
import { CategoryPreviewCard } from '@/components/category/CategoryPreviewCard';
import { CarouselItem } from '@/components/ui/carousel';
import { useAds } from '@/hooks/use-ads';
import { AdCard } from '@/components/AdCard';
import { ProductCard } from '@/components/product-card';
import type { Ad, Product } from '@/lib/types';


// Define a new type for the feed content
type FeedItem = (Product | (Ad & { displaySize: 'small' | 'large' }));

const HomePageSkeleton = () => (
    <>
        <Header />
        <main className="flex-1 pb-16 md:pb-0 py-6 space-y-8">
            {/* Category Showcase Skeleton */}
            <section>
                <Skeleton className="h-8 w-48 mb-4 ml-4" />
                <div className="flex gap-4 overflow-x-auto pb-4 px-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center space-y-2 flex-shrink-0">
                            <Skeleton className="w-20 h-20 rounded-lg" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </section>

             {/* Bestsellers Skeleton */}
             <section>
                <Skeleton className="h-8 w-32 mb-4 ml-4" />
                <div className="flex gap-4 overflow-x-auto pb-4 px-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="w-80 h-72 rounded-lg flex-shrink-0" />
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
  const [justForYouContent, setJustForYouContent] = useState<FeedItem[]>([]);

  useEffect(() => {
    if (ads.length > 0) {
      setShuffledAds([...ads].sort(() => 0.5 - Math.random()));
    }
  }, [ads]);

  useEffect(() => {
    if (products.length > 0 && ads.length > 0) {
        const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
        const localShuffledAds = [...ads].sort(() => 0.5 - Math.random());
        
        const feed: FeedItem[] = [];
        let adIndex = 0;
        const adInterval = 6;

        shuffledProducts.forEach((product, index) => {
            feed.push(product);
            if ((index + 1) % adInterval === 0 && adIndex < localShuffledAds.length) {
                const ad = localShuffledAds[adIndex];
                // Randomly decide the size of the ad
                const displaySize = Math.random() > 0.7 ? 'large' : 'small';
                feed.push({ ...ad, displaySize });
                adIndex++;
            }
        });
        setJustForYouContent(feed);
    } else if (products.length > 0) {
        setJustForYouContent([...products].sort(() => 0.5 - Math.random()));
    }
  }, [products, ads]);


  const homePageData = useMemo(() => {
    if (products.length > 0) {
      return getHomePageData(products);
    }
    return null;
  }, [products]);

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
  
  const { showcaseCategories, bestsellerCategories, previewCategories } = homePageData;

  // Interleave ads with category previews
  const interleavedContent = [...previewCategories];
  if (shuffledAds.length > 0) {
    let adIndex = 0;
    // Insert an ad after every 2 category previews
    for (let i = 2; i < interleavedContent.length; i += 3) {
      if (adIndex < shuffledAds.length) {
        // Here we have to cast since there's no common type
        (interleavedContent as any[]).splice(i, 0, shuffledAds[adIndex]);
        adIndex++;
      }
    }
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
                <div className="container mx-auto px-4 mb-4">
                    <h2 className="text-2xl font-bold font-headline">Bestsellers</h2>
                </div>
                <HorizontalScroller>
                    {bestsellerCategories.map(category => (
                        <CarouselItem key={category.name} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                             <BestsellerCard category={category} />
                        </CarouselItem>
                    ))}
                </HorizontalScroller>
            </section>
        )}
        
        {interleavedContent.length > 0 && (
            <section className="py-4 space-y-6">
              <div className="container mx-auto px-4">
                  <h2 className="text-2xl font-bold font-headline">Explore More</h2>
              </div>
                <HorizontalScroller>
                    {interleavedContent.map((item, index) => {
                        if ('mediaType' in item) { // This is an Ad
                            return (
                                <CarouselItem key={(item as Ad).id || `ad-${index}`} className="basis-11/12 md:basis-1/2">
                                     <AdCard ad={item as Ad} className="aspect-video" />
                                </CarouselItem>
                            );
                        } else { // This is a CategoryPreview
                            return (
                                <CarouselItem key={(item as any).name} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <CategoryPreviewCard category={item} />
                                </CarouselItem>
                            );
                        }
                    })}
                </HorizontalScroller>
            </section>
        )}

        {justForYouContent.length > 0 && (
            <section className="py-8">
                 <div className="container mx-auto px-4 mb-4">
                    <h2 className="text-2xl font-bold font-headline">Just For You</h2>
                </div>
                <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {justForYouContent.map((item, index) => {
                         if ('mediaType' in item) { // This is an Ad
                            const ad = item as Ad & { displaySize: 'small' | 'large' };
                            const isLarge = ad.displaySize === 'large';
                            return (
                                <div key={ad.id || `ad-feed-${index}`} className={isLarge ? 'col-span-2' : ''}>
                                    <AdCard ad={ad} className={isLarge ? "aspect-video" : "aspect-[4/3]"} />
                                </div>
                            );
                        } else { // This is a Product
                            return (
                                <ProductCard key={(item as Product).id} product={item as Product} />
                            );
                        }
                    })}
                </div>
            </section>
        )}
      </main>
    </>
  );
}
