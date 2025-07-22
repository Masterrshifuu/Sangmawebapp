'use client';

import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import CategoryList from '@/components/category-list';
import { useData } from '@/context/data-context';
import AuthWrapper from '@/components/auth/auth-wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNavbar from '@/components/bottom-navbar';

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const { categories, products, loading } = useData();
  const openCategoryId = searchParams.get('open');

  if (loading) {
    return (
      <>
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-headline mb-8">All Categories</h1>
      <CategoryList
        categories={categories}
        products={products}
        openCategoryId={openCategoryId || undefined}
      />
    </>
  );
}

export default function CategoriesPage() {
  return (
    <AuthWrapper>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <CategoriesPageContent />
          </div>
        </main>
        <Footer />
        <div className="md:hidden">
          <BottomNavbar />
        </div>
      </div>
    </AuthWrapper>
  );
}
