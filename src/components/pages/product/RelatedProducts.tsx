
import { Product, Ad } from "@/lib/types";
import { HorizontalScroller } from "@/components/horizontal-scroller";
import { ProductCard } from "@/components/product-card";
import { AdCard } from "@/components/AdCard";
import { CarouselItem } from "@/components/ui/carousel";
import { useAds } from "@/hooks/use-ads";
import { shuffleArray } from "@/lib/utils"; // Assuming a utility for shuffling exists

export const SimilarProducts = ({ products }: { products: Product[] }) => {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4 font-headline">Similar Items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export const FeaturedProducts = ({ products }: { products: Product[] }) => {
    const featured = products.filter(p => p.isBestseller);
    if (featured.length === 0) return null;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4 font-headline">Featured Items</h2>
            <HorizontalScroller>
                {featured.map(product => (
                    <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                        <ProductCard product={product} />
                    </CarouselItem>
                ))}
            </HorizontalScroller>
        </section>
    );
};

export const RecommendedProducts = ({ products, currentProductId }: { products: Product[], currentProductId: string }) => {
    const { ads, loading: adsLoading } = useAds();

    // Filter and shuffle recommended products
    const recommendedProducts = shuffleArray(products.filter(p => p.id !== currentProductId)).slice(0, 10);

    // Combine and interleave products and ads
    const mixedContent = [];
    const adInterval = 4; // Insert ad after every 4 products
    let adIndex = 0;
    const shuffledAds = shuffleArray(ads);

    for (let i = 0; i < recommendedProducts.length; i++) {
        mixedContent.push(recommendedProducts[i]);
        if ((i + 1) % adInterval === 0 && adIndex < shuffledAds.length) {
            mixedContent.push(shuffledAds[adIndex]);
            adIndex++;
        }
    }

    // Append any remaining ads
    while (adIndex < shuffledAds.length) {
        mixedContent.push(shuffledAds[adIndex]);
        adIndex++;
    }

    if (recommendedProducts.length === 0 && mixedContent.length === 0) return null;

    // Type guard to differentiate between Product and Ad
    const isAd = (item: Product | Ad): item is Ad => (item as Ad).mediaUrl !== undefined;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4 font-headline">Recommended For You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mixedContent.map((item, index) => (
                    isAd(item) ? (
                        <AdCard key={`ad-${item.id || index}`} ad={item} /> // Use a unique key for ads
                    ) : (
                        <ProductCard key={`product-${item.id}`} product={item} /> // Use product id for product key
                    )
                ))}
            </div>
        </section>
    );
};
