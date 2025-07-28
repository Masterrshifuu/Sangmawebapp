
'use client';

import { useAuth } from '@/hooks/use-auth';
import { HomePageSkeleton } from '@/components/pages/home/HomePageSkeleton';
import HomeContent from '@/components/pages/home/HomeContent';
import { ProductsProvider } from '@/hooks/use-products';

const Home = () => {
    const { loading } = useAuth();

    if (loading) {
        return <HomePageSkeleton />;
    }
    
    return (
        <ProductsProvider>
            <HomeContent />
        </ProductsProvider>
    );
};

export default function HomePage() {
  return <Home />;
}
