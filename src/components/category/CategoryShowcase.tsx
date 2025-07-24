
'use client';

import type { ShowcaseCategory } from '@/lib/types';
import { CategoryPill } from './CategoryPill';
import { HorizontalScroller } from '../horizontal-scroller';
import { CarouselItem } from '../ui/carousel';

export function CategoryShowcase({
  showcaseCategories,
}: {
  showcaseCategories: ShowcaseCategory[];
}) {
  return (
    <HorizontalScroller>
      {showcaseCategories.map(category => (
        <CarouselItem key={category.name} className="basis-1/3 md:basis-1/4 lg:basis-1/6">
          <CategoryPill category={category} />
        </CarouselItem>
      ))}
    </HorizontalScroller>
  );
}
