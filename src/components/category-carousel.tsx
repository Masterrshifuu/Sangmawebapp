
'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Category, Product } from '@/lib/types';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type CategoryCarouselProps = {
  categories: Category[];
  products: Product[];
};

export default function CategoryCarousel({
  categories,
  products,
}: CategoryCarouselProps) {
  const [categoryImageUrls, setCategoryImageUrls] = useState<Record<string, string[]>>({});
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const [isTransitioning, setIsTransitioning] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const images: Record<string, string[]> = {};
    const initialIndices: Record<string, number> = {};
    const initialTransitions: Record<string, boolean> = {};

    for (const category of categories) {
      const productsInCategory = products.filter(
        (p) => p.category === category.name
      );
      if (productsInCategory.length > 0) {
        images[category.id] = productsInCategory.map((p) => p.imageUrl);
      } else {
        images[category.id] = [`https://placehold.co/64x64.png`];
      }
      initialIndices[category.id] = 1; // Start at the first "real" image
      initialTransitions[category.id] = true;
    }
    setCategoryImageUrls(images);
    setCurrentImageIndices(initialIndices);
    setIsTransitioning(initialTransitions);
  }, [categories, products]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndices((prevIndices) => {
        const newIndices = { ...prevIndices };
        for (const categoryId in newIndices) {
          const imagesForCategory = categoryImageUrls[categoryId] || [];
          if (imagesForCategory.length > 1) {
            setIsTransitioning(prev => ({...prev, [categoryId]: true}));
            newIndices[categoryId]++;
          }
        }
        return newIndices;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [categoryImageUrls]);

  const handleTransitionEnd = (categoryId: string) => {
      const images = categoryImageUrls[categoryId] || [];
      const currentIndex = currentImageIndices[categoryId];

      if (currentIndex >= images.length + 1) {
        setIsTransitioning(prev => ({...prev, [categoryId]: false}));
        setCurrentImageIndices(prev => ({...prev, [categoryId]: 1}));
      }
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-headline">Categories</h2>
        <Link
          href="/categories"
          className="flex items-center text-sm font-semibold text-primary hover:underline"
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 pb-4">
          {categories.map((category) => {
            const originalImages = categoryImageUrls[category.id] || [];
            if (originalImages.length === 0) originalImages.push('https://placehold.co/64x64.png');
            
            const imagesToShow = originalImages.length > 1 
              ? [originalImages[originalImages.length - 1], ...originalImages, originalImages[0]]
              : originalImages;
              
            const currentIndex = currentImageIndices[category.id] || 0;
            const transitionEnabled = isTransitioning[category.id] ?? true;

            return (
              <Link href={`/categories?open=${category.id}`} key={category.id}>
                <Card className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer whitespace-normal overflow-hidden">
                  <div
                    className="w-16 h-16 mb-2 relative overflow-hidden"
                    data-ai-hint="grocery category"
                  >
                    <div
                      className={cn(
                        'absolute inset-0 flex',
                        transitionEnabled && 'transition-transform duration-1000 ease-in-out'
                      )}
                      style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                        width: `${imagesToShow.length * 100}%`
                      }}
                      onTransitionEnd={() => handleTransitionEnd(category.id)}
                    >
                      {imagesToShow.map((url, index) => (
                        <div key={`${url}-${index}`} className="w-full h-full flex-shrink-0">
                          <Image
                            src={url}
                            alt={`${category.name} - image ${index + 1}`}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="font-semibold text-center line-clamp-2">
                    {category.name}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
