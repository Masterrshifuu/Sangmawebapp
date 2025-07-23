
import type { ShowcaseCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export function CategoryPill({ category }: { category: ShowcaseCategory }) {
  return (
    <Link href={`/category/${category.name.toLowerCase()}`} className="group block text-center">
        <div className="relative w-20 h-20 mx-auto rounded-lg overflow-hidden shadow-sm transition-shadow group-hover:shadow-md">
            <Image
                src={category.imageUrl || 'https://placehold.co/100x100.png'}
                alt={category.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="25vw"
            />
        </div>
        <h3 className="mt-2 text-sm font-medium text-foreground truncate group-hover:underline">{category.name}</h3>
    </Link>
  );
}
