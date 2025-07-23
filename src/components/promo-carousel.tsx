
'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const promos = [
  {
    text: 'Free delivery on orders over INR 1000 in South Tura',
    imageUrl: 'https://placehold.co/800x400.png',
    dataAiHint: 'delivery box'
  },
  {
    text: 'Fresh Vegetables Delivered Fast!',
    imageUrl: 'https://placehold.co/800x400.png',
    dataAiHint: 'fresh vegetables'
  },
  {
    text: 'Save Big on Household Essentials',
    imageUrl: 'https://placehold.co/800x400.png',
    dataAiHint: 'shopping cart'
  },
];

export default function PromoCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  return (
    <section className="mb-12">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {promos.map((promo, index) => (
            <div className="flex-grow-0 flex-shrink-0 w-full" key={index}>
              <Card className="overflow-hidden relative aspect-[2/1] md:aspect-[3/1] rounded-xl shadow-lg">
                <Image
                  src={promo.imageUrl}
                  alt="Promotional banner"
                  fill
                  className="object-cover"
                  data-ai-hint={promo.dataAiHint}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                  <h3 className="text-white text-2xl md:text-4xl font-extrabold font-headline text-center drop-shadow-lg">
                    {promo.text}
                  </h3>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
