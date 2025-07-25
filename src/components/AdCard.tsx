
'use client';

import Image from 'next/image';
import type { Ad } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function AdCard({ ad, className }: { ad: Ad, className?: string }) {
  const cardContent = (
    <div className="bg-card rounded-lg overflow-hidden shadow-md flex flex-col h-full group transition-shadow duration-300 hover:shadow-xl">
        <div className="relative w-full aspect-[4/3] bg-muted/30">
            {ad.mediaType === 'video' ? (
                <video
                  src={ad.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            ) : (
                <Image
                  src={ad.mediaUrl}
                  alt={ad.title || 'Advertisement'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
            )}
        </div>
        {ad.title && (
            <div className="p-3">
                <h3 className="font-semibold text-sm leading-tight truncate">{ad.title}</h3>
            </div>
        )}
    </div>
  );

  if (ad.link) {
    return (
        <Link href={ad.link} target="_blank" rel="noopener noreferrer" className={cn("block", className)}>
            {cardContent}
        </Link>
    );
  }

  return (
    <div className={cn(className)}>
        {cardContent}
    </div>
  );
}
