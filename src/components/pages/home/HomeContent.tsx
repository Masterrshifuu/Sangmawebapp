
'use client';

import Link from 'next/link';
import type { Ad, Product, BestsellerCategory, ShowcaseCategory } from '@/lib/types';
import Header from '@/components/header';
import { CategoryShowcase } from '@/components/category/CategoryShowcase';
import { HorizontalScroller } from '@/components/horizontal-scroller';
import { BestsellerCard } from '@/components/BestsellerCard';
import { CarouselItem } from '@/components/ui/carousel';
import { AdCard } from '@/components/AdCard';
import { ProductCard } from '@/components/product-card';
import { useProducts } from '@/hooks/use-products';
import { useAds } from '@/hooks/use-ads';
import { getHomePageData } from '@/lib/home';
import { HomePageSkeleton } from './HomePageSkeleton';
import { CategorySheet } from '@/components/sheets/CategorySheet';

type FeedItem = Product | Ad;

// Helper to check if an item is an Ad
const isAd = (item: FeedItem): item is Ad => {
  return 'mediaType' in item;
};

// Function to create the "Just For You" feed by interleaving ads with products
function createJustForYouFeed(products: Product[], ads: Ad[]): FeedItem[] {
  if (products.length === 0) {
    return ads; // Or return empty if no products means no feed
  }
  if (ads.length === 0) {
    return products;
  }

  const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
  const content: FeedItem[] = [...shuffledProducts];
  const adInterval = 5; // Insert an ad every 5 products
  const shuffledAds = [...ads].sort(() => 0.5 - Math.random());

  for (let i = 0; i < shuffledAds.length; i++) {
    const ad = shuffledAds[i];
    const insertionIndex = (i + 1) * adInterval;
    if (insertionIndex < content.length) {
      content.splice(insertionIndex, 0, ad);
    } else {
      content.push(ad);
    }
  }

  return content;
}

export default function HomeContent() {
  const { products, loading: productsLoading, error } = useProducts();
  const { ads, loading: adsLoading } = useAds();

  if (productsLoading || adsLoading) {
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

  if (products.length === 0) {
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

  const { showcaseCategories, bestsellerCategories }: {
      showcaseCategories: ShowcaseCategory[];
      bestsellerCategories: BestsellerCategory[];
  } = getHomePageData(products);

  const justForYouContent = createJustForYouFeed(products, ads);
  
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
         <section className="py-6">
            <div className="container mx-auto px-4 mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold font-headline">Shop by Category</h2>
                <CategorySheet>
                    <span className="text-sm font-medium text-accent-foreground hover:underline cursor-pointer">
                        View All &gt;
                    </span>
                </CategorySheet>
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
        
        {justForYouContent.length > 0 && (
            <section className="py-8">
                 <div className="container mx-auto px-4 mb-4">
                    <h2 className="text-2xl font-bold font-headline">Just For You</h2>
                </div>
                <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {justForYouContent.map((item, index) => (
                        isAd(item) ? (
                            <AdCard key={item.id || `ad-${index}`} ad={item} />
                        ) : (
                            <ProductCard key={item.id} product={item} />
                        )
                    ))}
                </div>
            </section>
        )}
      </main>
    </>
  );
}
