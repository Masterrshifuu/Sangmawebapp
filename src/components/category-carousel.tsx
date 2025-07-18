'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Category, Product } from '@/lib/types';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type CategoryCarouselProps = {
  categories: Category[];
  products: Product[];
};

export default function CategoryCarousel({
  categories,
  products,
}: CategoryCarouselProps) {
  const [categoryImageUrls, setCategoryImageUrls] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const images: Record<string, string> = {};
    for (const category of categories) {
      const firstProductInCategory = products.find(
        (p) => p.category === category.name
      );
      if (firstProductInCategory) {
        images[category.id] = firstProductInCategory.imageUrl;
      } else {
        images[category.id] = `https://placehold.co/64x64.png`;
      }
    }
    setCategoryImageUrls(images);
  }, [categories, products]);

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
            const imageUrl =
              categoryImageUrls[category.id] || `https://placehold.co/64x64.png`;

            return (
              <Link href={`/categories?open=${category.id}`} key={category.id}>
                <Card className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer whitespace-normal overflow-hidden">
                  <div
                    className="w-16 h-16 mb-2 relative"
                    data-ai-hint="grocery category"
                  >
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
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
