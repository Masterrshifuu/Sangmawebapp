'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

const promoMessages = [
  'Free delivery on orders over ₹1000 in South Tura',
  'Free delivery on orders over ₹1000 in North Tura',
  'Free delivery on orders over ₹3000 in Tura NEHU',
  'Search for any product you need!',
];

export default function PromoCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <section className="mb-12">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {promoMessages.map((message, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="bg-accent/50 border-accent shadow-none">
                  <CardContent className="flex items-center justify-center p-6">
                    <span className="text-sm md:text-base font-semibold text-accent-foreground text-center">
                      {message}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
