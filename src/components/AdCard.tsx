
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Ad } from '@/lib/types';

export function AdCard({ ad }: { ad: Ad }) {
  const renderMedia = () => {
    const mediaElement =
      ad.mediaType === 'video' ? (
        <video
          src={ad.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-contain"
        />
      ) : (
        <Image
          src={ad.mediaUrl}
          alt={ad.title || 'Advertisement'}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      );

    if (ad.link && ad.link !== '--') {
      return (
        <Link href={ad.link} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
          {mediaElement}
        </Link>
      );
    }
    return mediaElement;
  };

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="relative aspect-[2/1] md:aspect-[3/1] w-full overflow-hidden rounded-lg bg-muted/20">
          {renderMedia()}
        </div>
      </div>
    </section>
  );
}
