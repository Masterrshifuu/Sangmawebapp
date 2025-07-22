
'use client';

import { useState, useEffect, useRef } from 'react';
import CategoryCarousel from '@/components/category-carousel';
import ProductGrid from '@/components/product-grid';
import { useData } from '@/context/data-context';
import { Skeleton } from '@/components/ui/skeleton';
import PromoCarousel from '@/components/promo-carousel';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function HomePageContent() {
  const { products, categories, loading } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollableElement = scrollRef.current;
    if (!scrollableElement) return;

    const handleScroll = () => {
      setIsScrolled(scrollableElement.scrollTop > 10);
    };

    scrollableElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollableElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return (
       <div className="h-full overflow-y-auto">
        <Header isScrolled={false} />
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-48 w-full mb-12" />
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
            ))}
            </div>
        </div>
        <Footer />
      </div>
    );
  }

  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <Header isScrolled={isScrolled} />
      <div className="container mx-auto px-4 py-8">
        <CategoryCarousel categories={categories} products={products} />
        <PromoCarousel />
        <ProductGrid title="Bestsellers" products={bestsellers} />
      </div>
       <Footer />
    </div>
  );
}
