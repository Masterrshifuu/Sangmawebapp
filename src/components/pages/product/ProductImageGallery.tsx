
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (!carouselApi) return;
        
        setCurrentSlide(carouselApi.selectedScrollSnap());
        
        const onSelect = () => {
            setCurrentSlide(carouselApi.selectedScrollSnap());
        };
        carouselApi.on("select", onSelect);
        
        return () => {
            carouselApi.off("select", onSelect);
        };
    }, [carouselApi]);

    const handleThumbnailClick = useCallback((index: number) => {
        carouselApi?.scrollTo(index);
    }, [carouselApi]);

    return (
        <div>
            <Carousel setApi={setCarouselApi} className="w-full">
                <CarouselContent>
                    {images.map((img, index) => (
                        <CarouselItem key={index}>
                            <div className="aspect-square relative w-full bg-muted/30 rounded-lg overflow-hidden">
                                <Image
                                    src={img || 'https://placehold.co/600x600.png'}
                                    alt={`${productName} image ${index + 1}`}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={index === 0}
                                    data-ai-hint="product image"
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {images.length > 1 && (
                    <>
                        <CarouselPrevious className="absolute left-2" />
                        <CarouselNext className="absolute right-2" />
                    </>
                )}
            </Carousel>

            {images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => handleThumbnailClick(index)}
                            className={cn(
                                "aspect-square relative rounded-md overflow-hidden transition-all",
                                "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                currentSlide === index ? 'ring-2 ring-primary' : 'hover:opacity-80'
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${productName} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="20vw"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
