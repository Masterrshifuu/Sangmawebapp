'use client';

import CategoryList from "@/components/category-list";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { Skeleton } from '@/components/ui/skeleton';

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const { categories, products, loading } = useData();
  const openCategoryId = searchParams.get('open');

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-8">All Categories</h1>
      <CategoryList categories={categories} products={products} openCategoryId={openCategoryId || undefined} />
    </div>
  );
}


export default function CategoriesPage() {
  return (
    <AuthWrapper>
      <CategoriesPageContent />
    </AuthWrapper>
  );
}
