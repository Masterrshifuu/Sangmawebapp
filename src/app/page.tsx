'use client';

import CategoryCarousel from '@/components/category-carousel';
import ProductGrid from '@/components/product-grid';
import AuthWrapper from '@/components/auth/auth-wrapper';
import { useEffect, useState } from 'react';
import type { Product, Category } from '@/lib/types';
import { listenToProducts, listenToCategories } from '@/lib/data-realtime';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubscribeProducts = listenToProducts(setProducts);
    const unsubscribeCategories = listenToCategories(setCategories);

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <CategoryCarousel categories={categories} products={products} />

        <ProductGrid title="Bestsellers" products={bestsellers} />

        {categories.map((category) => (
          <ProductGrid
            key={category.id}
            title={category.name}
            products={products.filter((p) => p.category === category.name)}
          />
        ))}
      </div>
    </AuthWrapper>
  );
}
