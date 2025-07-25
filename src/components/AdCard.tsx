
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Ad } from '@/lib/types';
import { cn } from '@/lib/utils';

export function AdCard({ ad, className }: { ad: Ad, className?: string }) {
  
  if (ad.mediaType === 'video') {
    return (
      <div className={cn("relative w-full overflow-hidden rounded-lg bg-muted/20", className)}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={ad.mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-muted/20", className)}>
        <Image
          src={ad.mediaUrl}
          alt={ad.title || 'Advertisement'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
    </div>
  );
}
