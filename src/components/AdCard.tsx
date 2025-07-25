
'use client';

import Image from 'next/image';
import type { Ad } from '@/lib/types';
import { cn } from '@/lib/utils';

export function AdCard({ ad, className }: { ad: Ad, className?: string }) {
  
  if (ad.mediaType === 'video') {
    // Using an iframe for data URLs is more robust for embedded content.
    return (
      <div className={cn("relative w-full overflow-hidden rounded-lg bg-muted/20", className)}>
        <iframe
          src={ad.mediaUrl}
          title={ad.title || 'Advertisement Video'}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
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
