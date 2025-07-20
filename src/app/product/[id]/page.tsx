'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { listenToProducts } from '@/lib/data-realtime';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { AddToCartSection } from '@/components/add-to-cart-section';
import SimilarProducts from '@/components/similar-products';
import { Loader2 } from 'lucide-react';
import AuthWrapper from '@/components/auth/auth-wrapper';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    
    setLoading(true);
    window.scrollTo(0, 0);

    const unsubscribe = listenToProducts((allProducts) => {
      const currentProduct = allProducts.find((p) => p.id === productId);

      if (currentProduct) {
        setProduct(currentProduct);
        const relatedProducts = allProducts.filter(
          (p) =>
            p.category === currentProduct.category && p.id !== currentProduct.id
        );
        setSimilarProducts(relatedProducts);
      } else {
        // If product disappears from DB, redirect
        router.replace('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId, router]);

  if (loading || !product) {
    return (
      <AuthWrapper>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
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
    </AuthWrapper>
  );
}
