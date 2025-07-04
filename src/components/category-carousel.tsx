import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Category, Product } from "@/lib/types";

type CategoryCarouselProps = {
  categories: Category[];
  products: Product[];
};

export default function CategoryCarousel({
  categories,
  products,
}: CategoryCarouselProps) {
  const getCategoryImage = (categoryName: string) => {
    const productsInCategory = products.filter(
      (p) => p.category === categoryName
    );
    if (productsInCategory.length > 0) {
      const randomIndex = Math.floor(Math.random() * productsInCategory.length);
      return productsInCategory[randomIndex].imageUrl;
    }
    return `https://placehold.co/64x64.png`;
  };

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold font-headline mb-6">Categories</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 pb-4">
          {categories.map((category) => {
            const imageUrl = getCategoryImage(category.name);
            return (
              <Card
                key={category.id}
                className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div
                  className="w-16 h-16 mb-2 relative"
                  data-ai-hint="grocery category"
                >
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <span className="font-semibold text-center">{category.name}</span>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
