'use client';

import AuthWrapper from '@/components/auth/auth-wrapper';
import Header from '@/components/header';
import Footer from '@/components/footer';
import CategoryCarousel from '@/components/category-carousel';
import ProductGrid from '@/components/product-grid';
import { useData } from '@/context/data-context';
import { Skeleton } from '@/components/ui/skeleton';
import PromoCarousel from '@/components/promo-carousel';


function HomePageContent() {
  const { products, categories, loading } = useData();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-48 w-full mb-12" />
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryCarousel categories={categories} products={products} />
      <PromoCarousel />
      <ProductGrid title="Bestsellers" products={bestsellers} />
    </div>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <HomePageContent />
        </main>
        <Footer />
      </div>
    </AuthWrapper>
  );
}
