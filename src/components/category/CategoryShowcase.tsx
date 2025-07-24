
'use client';

import type { Product, ShowcaseCategory } from '@/lib/types';
import { CategoryPill } from './CategoryPill';

export function CategoryShowcase({
  showcaseCategories,
}: {
  showcaseCategories: ShowcaseCategory[];
  productsByCategory: Record<string, Product[]>;
}) {
  return (
    <div className="px-4">
        <div className="grid grid-cols-4 gap-4">
            {showcaseCategories.slice(0, 4).map(category => (
                <div key={category.name}>
                    <CategoryPill category={category} />
                </div>
            ))}
        </div>
    </div>
  );
}
