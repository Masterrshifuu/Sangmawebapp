'use client';

import { getProducts, getCategories } from '@/lib/data';
import CategoryCarousel from '@/components/category-carousel';
import ProductGrid from '@/components/product-grid';
import AuthWrapper from '@/components/auth/auth-wrapper';
import { useEffect, useState } from 'react';
import type { Product, Category } from '@/lib/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Failed to fetch initial data on client:', err);
      }
    }
    fetchData();
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
