
import type { ShowcaseCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export function CategoryPill({ category }: { category: ShowcaseCategory }) {
  return (
    <Link href={`/category/${category.name.toLowerCase()}`} className="group flex flex-col items-center space-y-2">
      <div className="w-20 h-20 relative rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors duration-300">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover"
          sizes="10vw"
        />
      </div>
      <span className="text-sm font-medium text-center truncate w-full">{category.name}</span>
    </Link>
  );
}
