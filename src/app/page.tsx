
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { HomePageSkeleton } from '@/components/pages/home/HomePageSkeleton';
import HomeContent from '@/components/pages/home/HomeContent';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <HomePageSkeleton />;
    }
  
    return <HomeContent />;
}
