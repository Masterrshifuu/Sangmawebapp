
'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function HorizontalScroller({ children }: { children: React.ReactNode }) {
  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 4000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
      className="w-full px-4"
    >
      <CarouselContent className="-ml-4">
          {children}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex left-0" />
      <CarouselNext className="hidden md:flex right-0" />
    </Carousel>
  );
}
