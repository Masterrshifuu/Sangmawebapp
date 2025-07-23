
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import CategoryCarousel from '@/components/category-carousel';
import ProductGrid from '@/components/product-grid';
import { useData } from '@/context/data-context';
import PromoCarousel from '@/components/promo-carousel';
import Footer from '@/components/footer';
import Logo from '@/components/logo';
import { getPersonalizedRecommendations } from '@/lib/personalization';
import type { Product } from '@/lib/types';
import Header from '@/components/header';
import BottomNavbar from '@/components/bottom-navbar';

interface HomePageProps {}

export default function Home({}: HomePageProps) {
  const { products, categories, loading } = useData();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const scrollableElement = scrollRef.current;
    if (!scrollableElement) return;

    const handleScroll = () => {
      const isNowScrolled = scrollableElement.scrollTop > 10;
      setIsScrolled(prev => prev !== isNowScrolled ? isNowScrolled : prev);
    };

    scrollableElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollableElement.removeEventListener('scroll', handleScroll);
    };
  }, [isClient]);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const recommendations = getPersonalizedRecommendations(products);
      setRecommendedProducts(recommendations);
    }
  }, [loading, products]);

  const otherCategoryProducts = useMemo(() => {
    if (loading) return [];

    const recommendedIds = new Set(recommendedProducts.map((p) => p.id));
    const remainingProducts = products.filter((p) => !recommendedIds.has(p.id));

    return categories.map((category) => ({
      ...category,
      products: remainingProducts.filter((p) => p.category === category.name),
    }));
  }, [loading, products, categories, recommendedProducts]);

  if (loading || !isClient) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Logo className="animate-logo-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <main className="container mx-auto px-4 py-8">
            <PromoCarousel />
            <CategoryCarousel categories={categories} products={products} />
            <ProductGrid title="Recommended for You" products={recommendedProducts} />
            {otherCategoryProducts.map((category) => (
            <ProductGrid
                key={category.id}
                title={category.name}
                products={category.products}
            />
            ))}
        </main>
        <Footer />
       </div>
       <div className="md:hidden">
         <BottomNavbar />
       </div>
    </div>
  );
}
