
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import CategoryCarousel from '@/components/category-carousel';
import ProductGrid from '@/components/product-grid';
import { useData } from '@/context/data-context';
import PromoCarousel from '@/components/promo-carousel';
import Footer from '@/components/footer';
import Logo from '../logo';
import { getPersonalizedRecommendations } from '@/lib/personalization';
import type { Product } from '@/lib/types';
import Header from '../header';

interface HomePageProps {
}

export default function HomePageContent({ }: HomePageProps) {
  const { products, categories, loading } = useData();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

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

  useEffect(() => {
    if (!loading && products.length > 0) {
      const recommendations = getPersonalizedRecommendations(products);
      setRecommendedProducts(recommendations);
    }
  }, [loading, products]);

  const otherCategoryProducts = useMemo(() => {
    if (loading) return [];
    
    // Get a set of recommended product IDs for quick lookup
    const recommendedIds = new Set(recommendedProducts.map(p => p.id));
    
    // Filter out products that are already in the recommended list
    const remainingProducts = products.filter(p => !recommendedIds.has(p.id));

    return categories.map(category => ({
      ...category,
      products: remainingProducts.filter(p => p.category === category.name),
    }));
  }, [loading, products, categories, recommendedProducts]);

  if (loading) {
    return (
       <div className="h-full flex flex-col items-center justify-center">
        <Logo className="animate-logo-pulse" />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <Header isScrolled={isScrolled} />
      <div className="container mx-auto px-4 py-8">
        <CategoryCarousel categories={categories} products={products} />
        <PromoCarousel />
        <ProductGrid title="Recommended for You" products={recommendedProducts} />
        {otherCategoryProducts.map(category => (
            <ProductGrid 
                key={category.id}
                title={category.name}
                products={category.products}
            />
        ))}
      </div>
       <Footer />
    </div>
  );
}
