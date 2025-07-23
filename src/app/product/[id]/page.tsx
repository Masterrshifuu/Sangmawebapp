
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { AddToCartSection } from '@/components/add-to-cart-section';
import SimilarProducts from '@/components/similar-products';
import { ArrowLeft } from 'lucide-react';
import AuthWrapper from '@/components/auth/auth-wrapper';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/data-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import BottomNavbar from '@/components/bottom-navbar';
import Logo from '@/components/logo';
import { trackProductView } from '@/lib/activity-tracker';

function ProductPageContent() {
  const params = useParams();
  const router = useRouter();
  const { products, loading: isDataLoading } = useData();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { product, similarProducts } = useMemo(() => {
    if (isDataLoading) {
      return { product: null, similarProducts: [] };
    }

    const currentProduct = products.find((p) => p.id === productId);
    if (!currentProduct) {
      return { product: null, similarProducts: [] };
    }

    const relatedProducts = products.filter(
      (p) =>
        p.category === currentProduct.category && p.id !== currentProduct.id
    );
    
    return { product: currentProduct, similarProducts: relatedProducts };
  }, [productId, products, isDataLoading]);

  useEffect(() => {
    if (product) {
      trackProductView(product.id, product.category);
    }
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);
  
  // Redirect if the product is not found after data has loaded
  useEffect(() => {
    if (!isDataLoading && !product) {
       router.replace('/');
    }
  }, [isDataLoading, product, router]);


  if (isDataLoading || !product) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Logo className="animate-logo-pulse" />
      </div>
    );
  }

  return (
    <>
      <Header isScrolled={true} />
      <main className="flex-1">
        <div className="relative container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-10 bg-background/50 backdrop-blur-sm rounded-full md:hidden"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4"
                data-ai-hint="product image"
              />
              <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 bg-accent text-accent-foreground"
                >
                  Instant Delivery
                </Badge>
            </div>

            <div className="flex flex-col justify-start space-y-6 pt-4 md:pt-0">
              <h1 className="font-headline text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold">
                  INR {product.price.toFixed(2)}
                </span>
              </div>
              <AddToCartSection product={product} />
            </div>
          </div>
          <SimilarProducts products={similarProducts} />
        </div>
      </main>
      <Footer />
      <div className="md:hidden">
        <BottomNavbar />
      </div>
    </>
  );
}

export default function ProductPage() {
  return (
    <AuthWrapper>
      <div className="flex flex-col min-h-screen">
        <ProductPageContent />
      </div>
    </AuthWrapper>
  );
}
