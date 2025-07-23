
'use client';

import type { Product, ShowcaseCategory } from '@/lib/types';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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
            loop: true,
            align: "start",
        }}
        plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
            }),
        ]}
    >
      <CarouselContent className="-ml-2">
        {showcaseCategories.map(category => (
          <CarouselItem key={category.name} className="pl-4 basis-1/3 md:basis-1/5 lg:basis-1/6">
              <CategoryPill category={category} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
