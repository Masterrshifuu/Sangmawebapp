
import type { BestsellerCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export function BestsellerCard({ category }: { category: BestsellerCategory }) {
  if (!category.images || category.images.length === 0) return null;

  return (
    <Link href={`/category/${category.name.toLowerCase()}`} className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-card">
      <div className="grid grid-cols-2 grid-rows-2 aspect-square">
        {category.images.slice(0, 4).map((img, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={img.src || `https://placehold.co/400x400.png`}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        ))}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-base group-hover:underline">{category.name}</h3>
      </div>
    </Link>
  );
}
