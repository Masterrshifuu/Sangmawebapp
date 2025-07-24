
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Ad } from '@/lib/types';
import { cn } from '@/lib/utils';

export function AdCard({ ad, className }: { ad: Ad, className?: string }) {
  const renderMedia = () => {
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
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-muted/20", className)}>
      {renderMedia()}
    </div>
  );
}
