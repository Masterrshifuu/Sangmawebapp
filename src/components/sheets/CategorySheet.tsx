
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

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


export function CategorySheet({ children }: { children: React.ReactNode }) {
  const { products, loading } = useProducts();

  const categories = useMemo(() => {
    if (products.length === 0) return [];
    
    const categoryMap = new Map<string, { name: string; imageUrl: string }>();
    
    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          name: product.category,
          imageUrl: product.imageUrl,
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a,b) => a.name.localeCompare(b.name));
  }, [products]);

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-full md:h-[80vh] flex flex-col p-0"
      >
        <DrawerHeader className="p-4 pt-4 text-center flex items-center justify-between border-b">
            <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="md:flex hidden">
                    <ChevronLeft />
                    <span className="sr-only">Back</span>
                </Button>
            </DrawerClose>
          <DrawerTitle className="flex-1 text-center">All Categories</DrawerTitle>
          <div className="w-10 md:block hidden" />
        </DrawerHeader>
        <ScrollArea className="flex-1">
            <main className="p-4">
                {loading ? (
                    <CategoryGridSkeleton />
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {categories.map(category => (
                            <DrawerClose key={category.name} asChild>
                                <Link
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
                            </DrawerClose>
                        ))}
                    </div>
                )}
            </main>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
