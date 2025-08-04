
import type { BestsellerCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export function CategoryPreviewCard({ category }: { category: BestsellerCategory }) {
  if (!category.images || category.images.length === 0) return null;

  return (
    <div className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-card p-3 h-full">
      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
      <div className="grid grid-cols-2 grid-rows-2 aspect-square gap-2 mb-2">
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
      <Link href={`/category/${category.name.toLowerCase().replace(/ & /g, '-and-')}`} className="text-sm font-medium text-accent-foreground hover:underline text-right block">
        + {Math.max(0, category.totalProducts - 4)} more &gt;
      </Link>
    </div>
  );
}
