
'use client';

import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
  } from "@/components/ui/carousel";

export function ProductCarousel({ products }: { products: Product[]}) {
    return (
        <Carousel
            opts={{
                align: "start",
                dragFree: true,
            }}
            className="w-full"
        >
            <CarouselContent className="-ml-4 px-4">
                {products.map(product => (
                    <CarouselItem key={product.id} className="pl-4 basis-2/5 md:basis-1/5 lg:basis-1/6">
                        <ProductCard product={product} />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
        </Carousel>
    )
}
