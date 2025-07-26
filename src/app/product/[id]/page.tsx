
'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';

import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

import Header from '@/components/header';
import SimilarProducts from '@/components/similar-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CartQuantityControl } from '@/components/cart/CartQuantityControl';
import { useProducts } from '@/hooks/use-products';
import { getProductById } from '@/lib/products';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
  } from "@/components/ui/carousel"
import { HorizontalScroller } from '@/components/horizontal-scroller';
import { ProductCard } from '@/components/product-card';
import { DynamicDeliveryTime } from '@/components/DynamicDeliveryTime';

// Helper component for star ratings
const StarRating = ({ rating = 4.5, reviewCount = 0 }: { rating?: number; reviewCount?: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={cn("w-4 h-4", i < Math.floor(rating) ? 'fill-current' : 'text-gray-300')} strokeWidth={1.5} />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({reviewCount.toLocaleString()} reviews)</span>
    </div>
  );

// Loading skeleton for the new page design
const ProductPageSkeleton = () => (
    <>
        <Header />
        <main className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <div className="mt-4 grid grid-cols-5 gap-4">
                        <Skeleton className="w-full aspect-square rounded-md" />
                        <Skeleton className="w-full aspect-square rounded-md" />
                        <Skeleton className="w-full aspect-square rounded-md" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-12 w-36 rounded-lg" />
                    </div>
                </div>
            </div>
        </main>
    </>
);

const FeaturedProducts = ({ products }: { products: Product[] }) => {
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
}

const RecommendedProducts = ({ products, currentProductId }: { products: Product[], currentProductId: string }) => {
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

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { cart, addItem } = useCart();
  const { products, loading: productsLoading, error: productsError } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const fetchProductData = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        
        // First, try to find the product in the global list
        const productFromState = products.find(p => p.id === id);

        if (productFromState) {
            setProduct(productFromState);
        } else {
            // If not found (e.g., direct link or out of stock), fetch it directly
            const { product: fetchedProduct, error: fetchError } = await getProductById(id);
            if (fetchError) {
                setError(fetchError);
            } else {
                setProduct(fetchedProduct);
            }
        }
    };

    // Only fetch when products are loaded or if it's the initial load
    if (!productsLoading) {
        fetchProductData();
    }
  }, [id, products, productsLoading]);

  useEffect(() => {
    if (product) {
        // Find similar products from the global list
        const currentSimilarProducts = products
          .filter(p => p.category === product.category && p.id !== product.id)
          .slice(0, 10);
        setSimilarProducts(currentSimilarProducts);
        setLoading(false);
    }
  }, [product, products]);


  useEffect(() => {
    if (!carouselApi) {
      return
    }
 
    setCurrentSlide(carouselApi.selectedScrollSnap())
 
    carouselApi.on("select", () => {
        setCurrentSlide(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  const handleThumbnailClick = useCallback((index: number) => {
    carouselApi?.scrollTo(index);
  }, [carouselApi]);

  if (loading) {
    return <ProductPageSkeleton />;
  }
  
  if (!product && !loading) {
      notFound();
  }

  if (error || productsError) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
            <Header />
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-2xl">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error || productsError}</p>
            </div>
      </div>
    );
  }

  if (!product) {
    return <ProductPageSkeleton />;
  }

  const cartItem = cart.find(item => item.product.id === product.id);
  const allImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);

  return (
    <>
        <Header />
        <main className="container mx-auto px-4 py-8 pb-32">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                {/* Image Gallery */}
                <div>
                    <Carousel setApi={setCarouselApi} className="w-full">
                        <CarouselContent>
                            {allImages.map((img, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-square relative w-full bg-muted/30 rounded-lg overflow-hidden">
                                        <Image
                                            src={img || 'https://placehold.co/600x600.png'}
                                            alt={`${product.name} image ${index + 1}`}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority={index === 0}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {allImages.length > 1 && (
                            <>
                                <CarouselPrevious className="absolute left-2" />
                                <CarouselNext className="absolute right-2" />
                            </>
                        )}
                    </Carousel>

                    {allImages.length > 1 && (
                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleThumbnailClick(index)}
                                    className={cn(
                                        "aspect-square relative rounded-md overflow-hidden transition-all",
                                        "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        currentSlide === index ? 'ring-2 ring-primary' : 'hover:opacity-80'
                                    )}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="20vw"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                {/* Product Details */}
                <div className="flex flex-col space-y-4">
                    <Badge variant="outline" className="w-fit">{product.category}</Badge>
                    
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
                    
                    <StarRating rating={product.rating} reviewCount={product.reviewCount} />

                    <p className="text-muted-foreground text-base leading-relaxed">
                        {product.description}
                    </p>

                    <DynamicDeliveryTime />

                    <div className="!mt-auto pt-6">
                        <Accordion type="single" collapsible defaultValue="item-1">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Product Information</AccordionTrigger>
                                <AccordionContent>
                                    Details about nutrition, origin, and storage.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border-b-0">
                                <AccordionTrigger>Brand Details</AccordionTrigger>
                                <AccordionContent>
                                    Information about the brand {product.brand || product.name.split(' ')[0]}.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="flex items-center justify-between p-4 border-t border-b rounded-lg bg-muted/30 mt-4">
                        <div>
                            {typeof product.mrp === 'number' && (
                                <p className="text-2xl font-bold">INR {product.mrp.toFixed(2)}</p>
                            )}
                        </div>
                        <div className="w-36">
                            {cartItem ? (
                                <CartQuantityControl product={product} />
                            ) : (
                                <Button 
                                    onClick={() => addItem(product)} 
                                    className="w-full"
                                    size="lg"
                                >
                                    Add to Cart
                                </Button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-24 space-y-16">
                <SimilarProducts products={similarProducts} />
                <FeaturedProducts products={products} />
                <RecommendedProducts products={products} currentProductId={product.id} />
            </div>
        </main>
    </>
  );
}
