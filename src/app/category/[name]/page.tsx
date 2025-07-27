
'use client';

import { useParams, notFound } from 'next/navigation';
import { useProducts } from '@/hooks/use-products';
import Header from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const CategoryPageSkeleton = () => (
    <>
        <Header />
        <main className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-card rounded-lg overflow-hidden shadow-md flex flex-col h-full">
                        <Skeleton className="w-full aspect-[4/3]" />
                        <div className="p-3 flex flex-col flex-grow">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/4 mb-4" />
                            <div className="mt-auto flex justify-between items-end">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-9 w-20 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    </>
)

export default function CategoryPage() {
    const params = useParams();
    const { products, loading } = useProducts();
    const categoryNameSlug = params.name as string;

    // Decode the slug back to the original category name format for filtering
    const categoryName = useMemo(() => {
        if (!categoryNameSlug) return '';
        const name = categoryNameSlug.replace(/-and-/g, ' & ');
        // Capitalize first letter of each word for display
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }, [categoryNameSlug]);
    

    const categoryProducts = useMemo(() => {
        if (loading || !categoryName) return [];
        return products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
    }, [products, categoryName, loading]);


    if (loading) {
        return <CategoryPageSkeleton />;
    }

    if (!loading && categoryProducts.length === 0) {
        // This will render a 404 page if no products are found for the category
        // This is useful for preventing empty pages or pages for non-existent categories
        notFound();
    }

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold font-headline mb-6">{categoryName}</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categoryProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </main>
        </>
    )
}
