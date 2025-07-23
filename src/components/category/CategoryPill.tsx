
import type { ShowcaseCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CategoryPill({ category }: { category: ShowcaseCategory }) {
  return (
    <Link 
      href={`/category/${category.name.toLowerCase()}`} 
      className={cn(
        "group flex flex-col items-center justify-start text-center p-2 rounded-lg border shadow-sm",
        "h-full transition-shadow hover:shadow-md"
      )}
    >
        <div className="relative w-full aspect-square mb-2">
            <Image
                src={category.imageUrl || 'https://placehold.co/100x100.png'}
                alt={category.name}
                fill
                className="object-contain transition-transform group-hover:scale-105"
                sizes="25vw"
            />
        </div>
        <h3 className="text-sm font-medium text-foreground leading-tight">
            {category.name}
        </h3>
    </Link>
  );
}
