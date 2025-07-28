
'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import type { Product, Review } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles } from 'lucide-react';

import { CartQuantityControl } from '@/components/cart/CartQuantityControl';
import { useProducts } from '@/hooks/use-products';
import { getProductById } from '@/lib/products';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { DynamicDeliveryTime } from '@/components/DynamicDeliveryTime';
import { getReviews, addReview } from '@/lib/reviews';
import { useToast } from '@/hooks/use-toast';

import { ProductPageSkeleton } from '@/components/pages/product/ProductPageSkeleton';
import { StarRating } from '@/components/pages/product/StarRating';
import { ReviewForm } from '@/components/pages/product/ReviewForm';
import { SimilarProducts, FeaturedProducts, RecommendedProducts } from '@/components/pages/product/RelatedProducts';
import { ProductImageGallery } from '@/components/pages/product/ProductImageGallery';
import { ProductReviews } from '@/components/pages/product/ProductReviews';


export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { cart, addItem } = useCart();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchProductData = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        
        const productFromState = products.find(p => p.id === id);

        if (productFromState) {
            setProduct(productFromState);
        } else {
            const { product: fetchedProduct, error: fetchError } = await getProductById(id);
            if (fetchError) {
                setError(fetchError);
            } else {
                setProduct(fetchedProduct);
            }
        }
        
        const fetchedReviews = await getReviews(id);
        setReviews(fetchedReviews);
    };

    if (!productsLoading) {
        fetchProductData();
    }
  }, [id, products, productsLoading]);

  useEffect(() => {
    if (product) {
        const currentSimilarProducts = products
          .filter(p => p.category === product.category && p.id !== product.id)
          .slice(0, 10);
        setSimilarProducts(currentSimilarProducts);
        setLoading(false);
    }
  }, [product, products]);

  const handleReviewAdded = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
    // Optimistically update product rating and count
    setProduct(prev => {
        if (!prev) return null;
        const newReviewCount = (prev.reviewCount || 0) + 1;
        const newRating = ((prev.rating || 0) * (prev.reviewCount || 0) + newReview.rating) / newReviewCount;
        return { ...prev, reviewCount: newReviewCount, rating: newRating };
    });
    toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
  }

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
                
                <ProductImageGallery images={allImages} productName={product.name} />

                {/* Product Details */}
                <div className="flex flex-col space-y-4">
                    <Badge variant="outline" className="w-fit">{product.category}</Badge>
                    
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
                    
                    <StarRating rating={product.rating} reviewCount={product.reviewCount} />

                    <p className="text-muted-foreground text-base leading-relaxed">
                        {product.description}
                    </p>

                    <Button variant="outline" asChild>
                        <Link href="/ai-chat">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Ask AI about this product
                        </Link>
                    </Button>

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
            
            <div className="mt-16 border-t pt-12 space-y-8">
                <h2 className="text-2xl font-bold font-headline">Ratings & Reviews</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <ReviewForm productId={product.id} onReviewAdded={handleReviewAdded} />
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <ProductReviews reviews={reviews} />
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
