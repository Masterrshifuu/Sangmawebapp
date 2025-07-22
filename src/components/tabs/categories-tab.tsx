
'use client';

import CategoryList from "@/components/category-list";
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { Skeleton } from '@/components/ui/skeleton';
import Header from "../header";
import Footer from "../footer";

export default function CategoriesTabContent() {
  const searchParams = useSearchParams();
  const { categories, products, loading } = useData();
  const openCategoryId = searchParams.get('open');

  const content = loading ? (
    <>
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
           <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </>
  ) : (
    <>
      <h1 className="text-3xl font-bold font-headline mb-8">All Categories</h1>
      <CategoryList categories={categories} products={products} openCategoryId={openCategoryId || undefined} />
    </>
  );

  return (
    <div className="h-full overflow-y-auto">
      <Header isScrolled={true} />
      <main className="container mx-auto px-4 py-8">
        {content}
      </main>
      <Footer />
    </div>
  );
}
