
'use client';

import { useState } from 'react';
import type { Product, Review } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { CartQuantityControl } from '@/components/cart/CartQuantityControl';
import { DynamicDeliveryTime } from '@/components/DynamicDeliveryTime';
import { addReview } from '@/lib/reviews';

import { StarRating } from '@/components/pages/product/StarRating';
import { ReviewForm } from '@/components/pages/product/ReviewForm';
import { SimilarProducts, FeaturedProducts, RecommendedProducts } from '@/components/pages/product/RelatedProducts';
import { ProductImageGallery } from '@/components/pages/product/ProductImageGallery';
import { ProductReviews } from '@/components/pages/product/ProductReviews';

interface ProductClientPageProps {
    product: Product;
    initialReviews: Review[];
    similarProducts: Product[];
    featuredProducts: Product[];
    recommendedProducts: Product[];
}

export function ProductClientPage({ 
    product, 
    initialReviews,
    similarProducts,
    featuredProducts,
    recommendedProducts
}: ProductClientPageProps) {
  const { cart, addItem } = useCart();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [currentProduct, setProduct] = useState<Product>(product);

  const handleReviewAdded = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
    // Optimistically update product rating and count
    setProduct(prev => {
        const newReviewCount = (prev.reviewCount || 0) + 1;
        const newRating = ((prev.rating || 0) * (prev.reviewCount || 0) + newReview.rating) / newReviewCount;
        return { ...prev, reviewCount: newReviewCount, rating: newRating };
    });
  }

  const cartItem = cart.find(item => item.product.id === currentProduct.id);
  const allImages = [currentProduct.imageUrl, ...(currentProduct.additionalImages || [])].filter(Boolean);

  return (
    <main className="container mx-auto px-4 py-8 pb-32">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            
            <div className="md:w-[80%] lg:w-[70%] justify-self-center">
                <ProductImageGallery images={allImages} productName={currentProduct.name} />
            </div>
            
            {/* Product Details */}
            <div className="flex flex-col space-y-4">
                <Badge variant="outline" className="w-fit">{currentProduct.category}</Badge>
                
                <h1 className="text-3xl lg:text-4xl font-bold font-headline">{currentProduct.name}</h1>
                
                <StarRating rating={currentProduct.rating} reviewCount={currentProduct.reviewCount} />

                <p className="text-muted-foreground text-base leading-relaxed">
                    {currentProduct.description}
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
                                Information about the brand {currentProduct.brand || currentProduct.name.split(' ')[0]}.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-b rounded-lg bg-muted/30 mt-4">
                    <div>
                        {typeof currentProduct.mrp === 'number' && (
                            <p className="text-2xl font-bold">₹{currentProduct.mrp.toFixed(2)}</p>
                        )}
                    </div>
                    <div className="w-36">
                        {cartItem ? (
                            <CartQuantityControl product={currentProduct} />
                        ) : (
                            <Button 
                                onClick={() => addItem(currentProduct)} 
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
                    <ReviewForm productId={currentProduct.id} onReviewAdded={handleReviewAdded} />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <ProductReviews reviews={reviews} />
                </div>
            </div>
        </div>

        <div className="mt-24 space-y-16">
            <SimilarProducts products={similarProducts} />
            <FeaturedProducts products={featuredProducts} />
            <RecommendedProducts products={recommendedProducts} currentProductId={currentProduct.id} />
        </div>
    </main>
  );
}
