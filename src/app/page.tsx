
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { HomePageSkeleton } from '@/components/pages/home/HomePageSkeleton';
import HomeContent from '@/components/pages/home/HomeContent';
import { ProductsProvider } from '@/hooks/use-products';

const Home = () => {
    return (
        <ProductsProvider>
            <HomeContent />
        </ProductsProvider>
    );
};

export default function HomePage() {
  const { loading } = useAuth();

  // We show a skeleton while the auth state is loading.
  // Once loaded, HomeContent will render. It's designed to handle both
  // logged-in and guest users gracefully.
  if (loading) {
    return <HomePageSkeleton />;
  }

  return <Home />;
}
