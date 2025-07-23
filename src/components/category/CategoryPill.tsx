
import type { ShowcaseCategory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export function CategoryPill({ category }: { category: ShowcaseCategory }) {
  return (
    <Link href={`/category/${category.name.toLowerCase()}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-0">
          <div className="aspect-[4/3] relative w-full">
            <Image
              src={category.imageUrl || 'https://placehold.co/400x300.png'}
              alt={category.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
          </div>
          <div className="p-3">
             <h3 className="text-sm font-semibold text-center truncate">{category.name}</h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
