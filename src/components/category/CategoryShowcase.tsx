
'use client';

import type { Product, ShowcaseCategory } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { CategoryPill } from './CategoryPill';

export function CategoryShowcase({
  showcaseCategories,
  productsByCategory
}: {
  showcaseCategories: ShowcaseCategory[];
  productsByCategory: Record<string, Product[]>;
}) {
  return (
    <Carousel
        opts={{
            align: "start",
            dragFree: true,
        }}
        className="px-4"
    >
      <CarouselContent className="-ml-4">
        {showcaseCategories.map(category => (
          <CarouselItem key={category.name} className="pl-4 basis-1/4 md:basis-1/6 lg:basis-1/8">
              <CategoryPill category={category} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
