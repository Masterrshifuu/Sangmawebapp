'use client';

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Category, Product } from "@/lib/types";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

  useEffect(() => {
    const images: Record<string, string[]> = {};
    const initialIndices: Record<string, number> = {};

    for (const category of categories) {
      const productsInCategory = products.filter(
        (p) => p.category === category.name
      );
      if (productsInCategory.length > 0) {
        images[category.id] = productsInCategory.map(p => p.imageUrl);
      } else {
        images[category.id] = [`https://placehold.co/64x64.png`];
      }
      initialIndices[category.id] = 0;
    }
    setCategoryImageUrls(images);
    setCurrentImageIndices(initialIndices);
  }, [categories, products]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndices(prevIndices => {
        const newIndices: Record<string, number> = {};
        for (const categoryId in prevIndices) {
          const imagesForCategory = categoryImageUrls[categoryId] || [];
          if (imagesForCategory.length > 1) {
            newIndices[categoryId] = (prevIndices[categoryId] + 1) % imagesForCategory.length;
          } else {
            newIndices[categoryId] = 0;
          }
        }
        return newIndices;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [categoryImageUrls]);


  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-headline">Categories</h2>
        <Link href="/categories" className="flex items-center text-sm font-semibold text-primary hover:underline">
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 pb-4">
          {categories.map((category) => {
            const imageUrls = categoryImageUrls[category.id] || [`https://placehold.co/64x64.png`];
            const currentIndex = currentImageIndices[category.id] || 0;
            
            return (
              <Link href={`/categories?open=${category.id}`} key={category.id}>
                <Card
                  className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer whitespace-normal"
                >
                  <div
                    className="w-16 h-16 mb-2 relative overflow-hidden"
                    data-ai-hint="grocery category"
                  >
                   <div 
                      className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
                      style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                      {imageUrls.map((url, index) => (
                         <div key={`${url}-${index}`} className="relative w-full h-full flex-shrink-0">
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
                  <span className="font-semibold text-center line-clamp-2">{category.name}</span>
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
