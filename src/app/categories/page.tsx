'use client';

import { useState, useEffect } from 'react';
import { listenToCategories, listenToProducts } from "@/lib/data-realtime";
import CategoryList from "@/components/category-list";
import type { Metadata } from 'next';
import AuthWrapper from "@/components/auth/auth-wrapper";
import type { Product, Category } from "@/lib/types";
import { useSearchParams } from 'next/navigation';

// Note: Metadata is static and won't be part of the client component
// If dynamic metadata is needed based on fetched data, this approach would need revision.
// export const metadata: Metadata = {
//   title: 'All Categories - Sangma Megha Mart',
//   description: 'Browse all product categories and subcategories.',
// };

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const openCategoryId = searchParams.get('open');

  useEffect(() => {
    const unsubscribeCategories = listenToCategories(setCategories);
    const unsubscribeProducts = listenToProducts(setProducts);

    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, []);

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-8">All Categories</h1>
        <CategoryList categories={categories} products={products} openCategoryId={openCategoryId || undefined} />
      </div>
    </AuthWrapper>
  );
}
