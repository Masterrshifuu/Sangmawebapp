
'use client';

import Image from 'next/image';
import type { Ad } from '@/lib/types';
import { cn } from '@/lib/utils';

export function AdCard({ ad, className }: { ad: Ad, className?: string }) {
  
  if (ad.mediaType === 'video') {
    return (
        <div className={cn("relative w-full aspect-video overflow-hidden rounded-lg bg-muted/20", className)}>
            <video
              src={ad.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
        </div>
    );
  }

  return (
    <div className={cn("relative w-full aspect-square overflow-hidden rounded-lg bg-muted/20", className)}>
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
