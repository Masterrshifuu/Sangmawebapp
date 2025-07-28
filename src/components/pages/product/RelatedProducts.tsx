
import { Product } from "@/lib/types";
import { HorizontalScroller } from "@/components/horizontal-scroller";
import { ProductCard } from "@/components/product-card";
import { CarouselItem } from "@/components/ui/carousel";

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
    const recommended = products.filter(p => p.id !== currentProductId).sort(() => 0.5 - Math.random()).slice(0, 10);
    if (recommended.length === 0) return null;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4 font-headline">Recommended For You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommended.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};
