
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { BestsellerCategory } from '@/lib/types';
import Link from 'next/link';

interface BestsellerCardProps {
  category: BestsellerCategory;
}

export function BestsellerCard({ category }: BestsellerCardProps) {
  return (
    <Link href={`/categories?open=${category.id}`} className="block group">
        <Card className="h-full overflow-hidden transition-shadow duration-300 group-hover:shadow-xl">
        <CardHeader className="p-0">
            <div className="grid grid-cols-2 gap-1 aspect-[4/3]">
            {category.images.slice(0, 4).map((img, index) => (
                <div key={`${img.productId}-${index}`} className="relative w-full h-full">
                    <Image
                        src={img.imageUrl}
                        alt={`${category.name} bestseller ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 25vw, 15vw"
                        className="object-contain p-1"
                        data-ai-hint="product image"
                    />
                </div>
            ))}
            </div>
        </CardHeader>
        <CardContent className="p-3">
            <h3 className="font-semibold text-base truncate">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.productCount} products</p>
        </CardContent>
        </Card>
    </Link>
  );
}

