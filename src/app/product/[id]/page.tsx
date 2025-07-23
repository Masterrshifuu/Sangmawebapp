
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';

import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

import Header from '@/components/header';
import SimilarProducts from '@/components/similar-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CartQuantityControl } from '@/components/cart/CartQuantityControl';
import Footer from '@/components/footer';

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
        <Footer />
    </>
);

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { cart, addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { products: allProducts, error: fetchError } = await getProducts();
        if (fetchError) {
          throw new Error(fetchError);
        }

        const currentProduct = allProducts.find(p => p.id === id);

        if (!currentProduct) {
          throw new Error("Product not found");
        }
        
        setProduct(currentProduct);
        setSelectedImage(currentProduct.imageUrl);
        
        const currentSimilarProducts = allProducts
          .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
          .slice(0, 10);
        setSimilarProducts(currentSimilarProducts);

      } catch (err: any) {
        setError(err.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);
  
  if (loading) {
    return <ProductPageSkeleton />;
  }
  
  if (error === "Product not found") {
      notFound();
  }

  if (error || !product) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
            <Header />
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-2xl">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error || 'Could not load product details.'}</p>
            </div>
            <Footer />
      </div>
    );
  }

  const cartItem = cart.find(item => item.product.id === product.id);
  const allImages = [product.imageUrl, ...product.additionalImages].filter(Boolean);

  return (
    <>
        <Header />
        <main className="container mx-auto px-4 py-8 pb-32">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                {/* Image Gallery */}
                <div>
                    <div className="aspect-square relative w-full bg-muted/30 rounded-lg overflow-hidden">
                        <Image
                            key={selectedImage}
                            src={selectedImage}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </div>
                    {allImages.length > 1 && (
                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(img)}
                                    className={cn(
                                        "aspect-square relative rounded-md overflow-hidden transition-all",
                                        "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        selectedImage === img ? 'ring-2 ring-primary' : 'hover:opacity-80'
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

                    {product.instantDelivery && 
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                            <Clock className="w-5 h-5" />
                            <span>Instant Delivery: Approx. 14 mins</span>
                        </div>
                    }

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
                            <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-sm text-muted-foreground line-through">MRP ₹{product.mrp.toFixed(2)}</span>
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

            <div className="mt-24">
                <SimilarProducts products={similarProducts} />
            </div>
        </main>
        <Footer />
    </>
  );
}
