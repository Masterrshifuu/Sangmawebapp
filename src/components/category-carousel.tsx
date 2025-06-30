import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Category } from "@/lib/types";

type CategoryCarouselProps = {
  categories: Category[];
};

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold font-headline mb-6">Categories</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 pb-4">
          {categories.map((category) => (
            <Card key={category.id} className="flex-shrink-0 w-[150px] h-[150px] flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 mb-2" data-ai-hint="grocery category">
                <Image
                  src={`https://placehold.co/64x64.png`}
                  alt={category.name}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-center">{category.name}</span>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
