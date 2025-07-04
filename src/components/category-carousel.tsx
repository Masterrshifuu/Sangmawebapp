'use client';

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Category, Product } from "@/lib/types";
import { useState, useEffect } from "react";

type CategoryCarouselProps = {
  categories: Category[];
  products: Product[];
};

export default function CategoryCarousel({
  categories,
  products,
}: CategoryCarouselProps) {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const images: Record<string, string> = {};
    for (const category of categories) {
      const productsInCategory = products.filter(
        (p) => p.category === category.name
      );
      if (productsInCategory.length > 0) {
        const randomIndex = Math.floor(Math.random() * productsInCategory.length);
        images[category.name] = productsInCategory[randomIndex].imageUrl;
      } else {
        images[category.name] = `https://placehold.co/64x64.png`;
      }
    }
    setCategoryImages(images);
  }, [categories, products]);

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold font-headline mb-6">Categories</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 pb-4">
          {categories.map((category) => {
            const imageUrl = categoryImages[category.name] || `https://placehold.co/64x64.png`;
            return (
              <Card
                key={category.id}
                className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer whitespace-normal"
              >
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
                <span className="font-semibold text-center line-clamp-2">{category.name}</span>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
