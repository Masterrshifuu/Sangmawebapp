
import type { BestsellerCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export function BestsellerCard({ category }: { category: BestsellerCategory }) {
  if (!category.images || category.images.length === 0) return null;

  return (
    <div className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-card p-3 h-full">
      <div className="grid grid-cols-2 grid-rows-2 aspect-square gap-2">
        {category.images.slice(0, 4).map((img, index) => (
          <div key={index} className="relative aspect-square bg-muted/30 rounded-md overflow-hidden">
            <Image
              src={img.src || `https://placehold.co/200x200.png`}
              alt={img.alt}
              fill
              className="object-contain"
              sizes="25vw"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between items-center">
        <h3 className="font-semibold text-base group-hover:underline">{category.name}</h3>
        <Link href={`/category/${category.name.toLowerCase().replace(/ & /g, '-and-')}`} className="text-sm font-medium text-accent-foreground hover:underline">
          View All &gt;
        </Link>
      </div>
    </div>
  );
}
