'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Category, Product } from "@/lib/types";
import ProductCard from "./product-card";

type CategoryListProps = {
  categories: Category[];
  products: Product[];
  openCategoryId?: string;
};

export default function CategoryList({ categories, products, openCategoryId }: CategoryListProps) {
  return (
    <Accordion type="multiple" defaultValue={openCategoryId ? [openCategoryId] : []} className="w-full">
      {categories.map((category) => {
        const productsInCategory = products.filter(
          (p) => p.category === category.name
        );

        return (
          <AccordionItem value={category.id} key={category.id}>
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              {category.name}
            </AccordionTrigger>
            <AccordionContent>
              {productsInCategory.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-2">
                  {productsInCategory.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      size="small"
                    />
                  ))}
                </div>
              ) : (
                <p className="pl-4 text-muted-foreground">
                  No products in this category.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
