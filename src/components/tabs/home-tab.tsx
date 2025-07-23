
'use client';

import { useState, useEffect, useRef } from 'react';
import CategoryCarousel from '@/components/category-carousel';
import ProductGrid from '@/components/product-grid';
import { useData } from '@/context/data-context';
import PromoCarousel from '@/components/promo-carousel';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Logo from '../logo';

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
       <div className="h-full flex flex-col items-center justify-center">
        <Logo className="animate-logo-pulse" />
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
