
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useAds } from '@/hooks/use-ads';
import { Skeleton } from './ui/skeleton';

export function AdCarousel() {
  const { ads, loading, error } = useAds();

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (loading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="w-full aspect-[2/1] md:aspect-[3/1] rounded-lg" />
        </div>
      </section>
    );
  }

  if (error) {
    console.error("Ad Carousel Error:", error);
    return null; // Don't render anything if there's an error
  }

  if (ads.length === 0) {
    return null; // Don't render the section if there are no ads
  }

  const renderMedia = (ad: (typeof ads)[0]) => {
    const mediaElement =
      ad.mediaType === 'video' ? (
        <video
          src={ad.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <Image
          src={ad.mediaUrl}
          alt={ad.title || 'Advertisement'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      );

    if (ad.linkUrl) {
      return (
        <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
          {mediaElement}
        </Link>
      );
    }
    return mediaElement;
  };

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
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
            {ads.map((ad) => (
              <CarouselItem key={ad.id}>
                <div className="relative aspect-[2/1] md:aspect-[3/1] w-full overflow-hidden rounded-lg">
                  {renderMedia(ad)}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
