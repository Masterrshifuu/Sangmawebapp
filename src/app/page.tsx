
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getProducts, getCategories } from "@/lib/data";
import type { Product, Category } from "@/lib/types";
import CategoryCarousel from "@/components/category-carousel";
import ProductGrid from "@/components/product-grid";
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const [productsData, categoriesData] = await Promise.all([
            getProducts(),
            getCategories(),
          ]);
          setProducts(productsData);
          setCategories(categoriesData);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryCarousel categories={categories} />
      
      <ProductGrid title="Bestsellers" products={bestsellers} />

      {categories.map((category) => (
        <ProductGrid 
          key={category.id} 
          title={category.name} 
          products={products.filter((p) => p.category === category.name)} 
        />
      ))}
    </div>
  );
}
