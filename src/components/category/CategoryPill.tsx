
'use client';

import type { ShowcaseCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
  } from "@/components/ui/carousel"
import Autoplay from 'embla-carousel-autoplay';
import * as React from 'react';

export function CategoryPill({ category }: { category: ShowcaseCategory }) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000 + Math.random() * 1000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  if (!category.imageUrls || category.imageUrls.length === 0) {
    return null;
  }

  return (
    <Link 
      href={`/category/${category.name.toLowerCase()}`} 
      className={cn(
        "group flex flex-col items-center justify-start text-center p-2 rounded-lg border shadow-sm",
        "h-full transition-shadow hover:shadow-md"
      )}
    >
        <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
                loop: true,
            }}
        >
            <CarouselContent className="-ml-1">
                {category.imageUrls.map((imageUrl, index) => (
                    <CarouselItem key={index} className="pl-1">
                        <div className="relative w-full aspect-square">
                            <Image
                                src={imageUrl || 'https://placehold.co/100x100.png'}
                                alt={`${category.name} image ${index + 1}`}
                                fill
                                className="object-contain transition-transform group-hover:scale-105"
                                sizes="25vw"
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>

        <h3 className="text-sm font-medium text-foreground leading-tight mt-2">
            {category.name}
        </h3>
    </Link>
  );
}
