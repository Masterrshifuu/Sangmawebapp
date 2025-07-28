
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { HomePageSkeleton } from '@/components/pages/home/HomePageSkeleton';
import HomeContent from '@/components/pages/home/HomeContent';
import { ProductsProvider } from '@/hooks/use-products';

const Home = () => {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
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
