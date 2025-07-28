
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

const CategoryGridSkeleton = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <Skeleton className="h-4 w-16" />
            </div>
        ))}
    </div>
);

async function CategoriesList() {
    const { products } = await getProducts();
    
    const categoryMap = new Map<string, { name: string; imageUrl: string }>();
    
    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          name: product.category,
          imageUrl: product.imageUrl,
        });
      }
    });

    const categories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {categories.map(category => (
                <Link
                    key={category.name}
                    href={`/category/${encodeURIComponent(category.name.toLowerCase().replace(/ & /g, '-and-'))}`}
                    className="group flex flex-col items-center text-center gap-2 transition-transform active:scale-95"
                >
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted/30 border group-hover:shadow-md transition-shadow">
                        <Image
                            src={category.imageUrl || 'https://placehold.co/200x200.png'}
                            alt={category.name}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 768px) 33vw, 20vw"
                        />
                    </div>
                    <p className="text-sm font-semibold leading-tight group-hover:underline">{category.name}</p>
                </Link>
            ))}
        </div>
    );
}

export default function CategoriesPage() {
  return (
    <>
        <Header />
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold font-headline mb-6">All Categories</h1>
            <Suspense fallback={<CategoryGridSkeleton />}>
                <CategoriesList />
            </Suspense>
        </main>
    </>
  );
}
